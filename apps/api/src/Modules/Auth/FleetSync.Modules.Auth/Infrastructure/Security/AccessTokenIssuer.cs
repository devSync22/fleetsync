using System.Security.Claims;
using System.Text;
using FleetSync.Modules.Auth.Domain;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace FleetSync.Modules.Auth.Infrastructure.Security;

/// <summary>A signed JWT access token and when it stops being accepted.</summary>
internal sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);

/// <summary>
/// Issues the short-lived JWT access tokens that clients send as
/// <c>Authorization: Bearer …</c>. Claims use the standard short JWT names
/// (sub, email, name, role) so any client can read them.
/// </summary>
internal sealed class AccessTokenIssuer(IOptions<AuthOptions> options, TimeProvider clock)
{
    private readonly JsonWebTokenHandler _handler = new();

    public AccessToken Issue(ApplicationUser user, IEnumerable<string> roles)
    {
        var jwt = options.Value.Jwt;
        var now = clock.GetUtcNow();
        var expiresAt = now.AddMinutes(jwt.AccessTokenMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.Name, user.FullName),
            // Unique id per token, useful for auditing and future revocation lists.
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(role => new Claim(AuthClaimTypes.Role, role)));

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = jwt.Issuer,
            Audience = jwt.Audience,
            Subject = new ClaimsIdentity(claims),
            IssuedAt = now.UtcDateTime,
            NotBefore = now.UtcDateTime,
            Expires = expiresAt.UtcDateTime,
            SigningCredentials = new SigningCredentials(CreateSigningKey(jwt.SigningKey), SecurityAlgorithms.HmacSha256),
        };

        return new AccessToken(_handler.CreateToken(descriptor), expiresAt);
    }

    /// <summary>The symmetric key used both to sign (here) and validate (JwtBearer) tokens.</summary>
    public static SymmetricSecurityKey CreateSigningKey(string signingKey) =>
        new(Encoding.UTF8.GetBytes(signingKey));
}

/// <summary>Claim names used in FleetSync access tokens.</summary>
internal static class AuthClaimTypes
{
    public const string UserId = JwtRegisteredClaimNames.Sub;

    public const string Name = JwtRegisteredClaimNames.Name;

    public const string Role = "role";
}
