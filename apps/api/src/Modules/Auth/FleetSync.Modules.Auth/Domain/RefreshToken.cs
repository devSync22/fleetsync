namespace FleetSync.Modules.Auth.Domain;

/// <summary>
/// A long-lived credential used to get new access tokens without signing in again.
///
/// Only a SHA-256 hash of the token is stored, so a database leak does not
/// expose usable tokens. Tokens rotate: every refresh revokes the used token
/// and issues a new one in the same <see cref="FamilyId"/>. If a revoked token
/// is presented again, it has probably been stolen, so the whole family is revoked.
/// </summary>
internal sealed class RefreshToken
{
    // Required by EF Core.
    private RefreshToken()
    {
    }

    private RefreshToken(
        Guid userId,
        Guid familyId,
        string tokenHash,
        bool isPersistent,
        DateTimeOffset createdAt,
        DateTimeOffset expiresAt,
        ClientInfo client)
    {
        Id = Guid.CreateVersion7();
        UserId = userId;
        FamilyId = familyId;
        TokenHash = tokenHash;
        IsPersistent = isPersistent;
        CreatedAt = createdAt;
        ExpiresAt = expiresAt;
        IpAddress = client.IpAddress;
        UserAgent = client.UserAgent;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    /// <summary>Shared by every token issued from one sign-in (the rotation chain).</summary>
    public Guid FamilyId { get; private set; }

    /// <summary>SHA-256 hash (hex) of the raw token sent to the client.</summary>
    public string TokenHash { get; private set; } = string.Empty;

    /// <summary>True when the user ticked "Remember me" (longer lifetime, persistent cookie).</summary>
    public bool IsPersistent { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    /// <summary>Set when the token is used, logged out or revoked for security reasons.</summary>
    public DateTimeOffset? RevokedAt { get; private set; }

    /// <summary>The token that replaced this one during rotation, if any.</summary>
    public Guid? ReplacedByTokenId { get; private set; }

    /// <summary>Client IP when this token was issued (USER_SESSION.ip_address).</summary>
    public string? IpAddress { get; private set; }

    /// <summary>Browser / app User-Agent when issued (USER_SESSION.user_agent), truncated to 512 characters.</summary>
    public string? UserAgent { get; private set; }

    /// <summary>Starts a new rotation chain (a fresh sign-in).</summary>
    public static RefreshToken IssueNew(
        Guid userId,
        string tokenHash,
        bool isPersistent,
        DateTimeOffset now,
        TimeSpan lifetime,
        ClientInfo client) =>
        new(userId, Guid.CreateVersion7(), tokenHash, isPersistent, now, now + lifetime, client);

    /// <summary>
    /// Revokes this token and returns its successor in the same family.
    /// The caller must check <see cref="IsActive"/> first.
    /// </summary>
    public RefreshToken Rotate(string newTokenHash, DateTimeOffset now, TimeSpan lifetime, ClientInfo client)
    {
        var successor = new RefreshToken(
            UserId, FamilyId, newTokenHash, IsPersistent, now, now + lifetime, client);

        RevokedAt = now;
        ReplacedByTokenId = successor.Id;

        return successor;
    }

    /// <summary>True while the token can still be exchanged for a new access token.</summary>
    public bool IsActive(DateTimeOffset now) => RevokedAt is null && ExpiresAt > now;

    /// <summary>Revokes the token (no-op if it is already revoked).</summary>
    public void Revoke(DateTimeOffset now) => RevokedAt ??= now;
}

/// <summary>Where a request came from; recorded on sessions and audit entries.</summary>
internal sealed record ClientInfo(string? IpAddress, string? UserAgent)
{
    public const int MaxUserAgentLength = 512;

    public static readonly ClientInfo Unknown = new(null, null);
}
