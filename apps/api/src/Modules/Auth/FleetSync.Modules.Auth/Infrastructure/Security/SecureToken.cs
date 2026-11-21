using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;

namespace FleetSync.Modules.Auth.Infrastructure.Security;

/// <summary>
/// Creates and hashes the random tokens used for refresh tokens, emailed links
/// and staff activation. Raw tokens go to the client; only hashes are stored.
/// </summary>
internal static class SecureToken
{
    // 32 random bytes = 256 bits of entropy, far beyond guessing range.
    private const int TokenBytes = 32;

    /// <summary>A new URL-safe random token (43 characters).</summary>
    public static string Generate() =>
        WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(TokenBytes));

    /// <summary>
    /// SHA-256 of the token as lower-case hex. A fast hash is fine here because
    /// the input is high-entropy random data, not a user-chosen password.
    /// </summary>
    public static string Hash(string token) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
