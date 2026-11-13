namespace FleetSync.Modules.Auth.Domain;

/// <summary>What a <see cref="OneTimeToken"/> may be used for.</summary>
internal enum OneTimeTokenPurpose
{
    /// <summary>Link in the "verify your email" message after customer registration.</summary>
    EmailVerification = 1,

    /// <summary>Link in the "reset your password" message.</summary>
    PasswordReset = 2,
}

/// <summary>
/// A single-use, expiring token sent to a user by email (verify email, reset password).
///
/// The emailed link carries only the raw token (e.g. /reset-password?token=…);
/// the token alone identifies the account, which is what the web pages expect.
/// Only the SHA-256 hash is stored, and the token stops working once used.
/// </summary>
internal sealed class OneTimeToken
{
    // Required by EF Core.
    private OneTimeToken()
    {
    }

    public OneTimeToken(
        Guid userId,
        OneTimeTokenPurpose purpose,
        string tokenHash,
        DateTimeOffset now,
        TimeSpan lifetime)
    {
        Id = Guid.CreateVersion7();
        UserId = userId;
        Purpose = purpose;
        TokenHash = tokenHash;
        CreatedAt = now;
        ExpiresAt = now + lifetime;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    public OneTimeTokenPurpose Purpose { get; private set; }

    /// <summary>SHA-256 hash (hex) of the raw token in the emailed link.</summary>
    public string TokenHash { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    /// <summary>When the token was used or superseded by a newer one.</summary>
    public DateTimeOffset? ConsumedAt { get; private set; }

    /// <summary>True while the link can still be used.</summary>
    public bool IsUsable(DateTimeOffset now) => ConsumedAt is null && ExpiresAt > now;

    /// <summary>Marks the token as used so the same link cannot be replayed.</summary>
    public void Consume(DateTimeOffset now) => ConsumedAt ??= now;
}
