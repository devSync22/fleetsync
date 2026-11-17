using FleetSync.Modules.Auth.Application.Common;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Sessions;

/// <summary>Body of POST /api/auth/login (matches the web <c>LoginRequest</c> type).</summary>
internal sealed record LoginRequest(string Email, string Password, bool RememberMe);

/// <summary>
/// Body of POST /api/auth/refresh and /logout. Mobile sends the refresh token here;
/// the web app leaves it empty and relies on the HttpOnly cookie instead.
/// </summary>
internal sealed record RefreshRequest(string? RefreshToken);

/// <summary>The signed-in user, as returned by login and GET /api/auth/me.</summary>
internal sealed record AuthUserResponse(Guid Id, string Email, string FullName, IReadOnlyList<string> Roles);

/// <summary>
/// Returned by login and refresh. <see cref="RefreshToken"/> is only filled for
/// mobile clients; browsers receive it as an HttpOnly cookie so scripts can't read it.
/// </summary>
internal sealed record AuthSessionResponse(
    string AccessToken,
    string TokenType,
    DateTimeOffset AccessTokenExpiresAt,
    string? RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    AuthUserResponse User);

internal sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(r => r.Email).Email();

        // Only presence is checked: policy rules would leak hints about real passwords.
        RuleFor(r => r.Password)
            .NotEmpty().WithMessage("Enter your password.")
            .MaximumLength(FieldRules.PasswordMaxLength);
    }
}
