using System.Text;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Auth.Infrastructure.Storage;
using Microsoft.Extensions.Time.Testing;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

namespace FleetSync.Modules.Auth.UnitTests;

public sealed class SecureTokenTests
{
    [Fact]
    public void Generated_tokens_are_url_safe_and_unique()
    {
        var first = SecureToken.Generate();
        var second = SecureToken.Generate();

        Assert.NotEqual(first, second);
        Assert.Equal(43, first.Length);
        Assert.DoesNotContain(first, c => c is '+' or '/' or '=');
    }

    [Fact]
    public void Hash_is_stable_sha256_hex()
    {
        var hash = SecureToken.Hash("abc");

        Assert.Equal(64, hash.Length);
        Assert.Equal(hash, SecureToken.Hash("abc"));
        Assert.NotEqual(hash, SecureToken.Hash("abd"));
    }
}

public sealed class AccessTokenIssuerTests
{
    [Fact]
    public async Task Issued_token_validates_and_carries_user_claims()
    {
        var options = TestData.Options();
        var clock = new FakeTimeProvider(DateTimeOffset.UtcNow);
        var issuer = new AccessTokenIssuer(options, clock);
        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "a@example.com", FullName = "Ayesha Perera" };

        var token = issuer.Issue(user, [AuthRoles.FleetAdministrator]);

        var result = await new JsonWebTokenHandler().ValidateTokenAsync(token.Token, new TokenValidationParameters
        {
            ValidIssuer = options.Value.Jwt.Issuer,
            ValidAudience = options.Value.Jwt.Audience,
            IssuerSigningKey = AccessTokenIssuer.CreateSigningKey(options.Value.Jwt.SigningKey),
        });

        Assert.True(result.IsValid, result.Exception?.Message);
        Assert.Equal(user.Id.ToString(), result.Claims[AuthClaimTypes.UserId]);
        Assert.Equal(AuthRoles.FleetAdministrator, result.Claims[AuthClaimTypes.Role]);
        Assert.Equal(clock.GetUtcNow().AddMinutes(15), token.ExpiresAt);
    }
}

public sealed class DocumentInspectorTests
{
    [Fact]
    public async Task Detects_pdf_and_jpeg_by_content()
    {
        var pdf = await DocumentInspector.DetectAsync(new MemoryStream("%PDF-1.7"u8.ToArray()), default);
        var jpeg = await DocumentInspector.DetectAsync(new MemoryStream([0xFF, 0xD8, 0xFF, 0xE0]), default);

        Assert.Equal("application/pdf", pdf?.ContentType);
        Assert.Equal("image/jpeg", jpeg?.ContentType);
    }

    [Fact]
    public async Task Rejects_other_content_even_with_a_pdf_name() =>
        Assert.Null(await DocumentInspector.DetectAsync(new MemoryStream(Encoding.UTF8.GetBytes("MZ fake exe")), default));

    [Theory]
    [InlineData("nic.pdf", true)]
    [InlineData("licence.JPG", true)]
    [InlineData("photo.jpeg", true)]
    [InlineData("script.exe", false)]
    [InlineData("image.png", false)]
    public void Allows_only_pdf_and_jpg_extensions(string name, bool expected) =>
        Assert.Equal(expected, DocumentInspector.HasAllowedExtension(name));

    [Fact]
    public void Sanitize_removes_paths() =>
        Assert.Equal("nic.pdf", DocumentInspector.SanitizeFileName(@"..\..\secret\nic.pdf"));
}

public sealed class ApiEnumTests
{
    [Theory]
    [InlineData("light-lorry", nameof(LicenceClass.LightLorry))]
    [InlineData("HEAVY-TRAILER", nameof(LicenceClass.HeavyTrailer))]
    [InlineData(" light ", nameof(LicenceClass.Light))]
    public void Parses_kebab_case(string value, string expected)
    {
        Assert.True(ApiEnum.TryParse<LicenceClass>(value, out var parsed));
        Assert.Equal(Enum.Parse<LicenceClass>(expected), parsed);
    }

    [Theory]
    [InlineData("LightLorry")]
    [InlineData("2")]
    [InlineData("")]
    [InlineData(null)]
    public void Rejects_unknown_values(string? value) =>
        Assert.False(ApiEnum.TryParse<LicenceClass>(value, out _));

    [Fact]
    public void Formats_as_kebab_case() =>
        Assert.Equal("fleet-administrator", ApiEnum.ToApiString(TestRole.FleetAdministrator));

    private enum TestRole { FleetAdministrator }
}

public sealed class ReferenceNumberTests
{
    [Theory]
    [InlineData(2026, 142, "REG-2026-0142")]
    [InlineData(2026, 12345, "REG-2026-12345")]
    public void Formats_registration_references(int year, long number, string expected) =>
        Assert.Equal(expected, ReferenceNumberGenerator.Format(year, number));
}
