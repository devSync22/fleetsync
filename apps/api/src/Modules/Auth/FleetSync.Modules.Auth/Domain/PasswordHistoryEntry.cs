namespace FleetSync.Modules.Auth.Domain;

/// <summary>
/// A previous password hash, kept so a password reset can reject
/// "the same as your last password" (a rule only the server can check).
/// </summary>
internal sealed class PasswordHistoryEntry
{
    // Required by EF Core.
    private PasswordHistoryEntry()
    {
    }

    public PasswordHistoryEntry(Guid userId, string passwordHash, DateTimeOffset createdAt)
    {
        Id = Guid.CreateVersion7();
        UserId = userId;
        PasswordHash = passwordHash;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public Guid UserId { get; private set; }

    /// <summary>The Identity password hash that was replaced (never the plain password).</summary>
    public string PasswordHash { get; private set; } = string.Empty;

    /// <summary>When this password stopped being the current one.</summary>
    public DateTimeOffset CreatedAt { get; private set; }
}
