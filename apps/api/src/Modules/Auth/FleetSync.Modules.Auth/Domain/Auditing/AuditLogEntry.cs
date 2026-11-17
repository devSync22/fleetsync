namespace FleetSync.Modules.Auth.Domain.Auditing;

/// <summary>
/// AUDIT_LOG: one security-relevant event (sign-in, sign-out, review decisions…).
/// Rows are only ever inserted, never updated.
/// </summary>
internal sealed class AuditLogEntry
{
    // Required by EF Core.
    private AuditLogEntry()
    {
    }

    public AuditLogEntry(
        string entityType,
        string? entityId,
        string action,
        DateTimeOffset occurredAt,
        string? details,
        Guid? userId,
        string? ipAddress)
    {
        Id = Guid.CreateVersion7();
        EntityType = entityType;
        EntityId = entityId;
        Action = action;
        OccurredAt = occurredAt;
        Details = details;
        UserId = userId;
        IpAddress = ipAddress;
    }

    public Guid Id { get; private set; }

    /// <summary>What the event is about, e.g. "User", "UserApplication" (see <see cref="AuditEntityTypes"/>).</summary>
    public string EntityType { get; private set; } = string.Empty;

    /// <summary>Id of that entity, as text so any key type fits.</summary>
    public string? EntityId { get; private set; }

    /// <summary>e.g. "LOGIN", "LOGOUT" (see <see cref="AuditActions"/>).</summary>
    public string Action { get; private set; } = string.Empty;

    public DateTimeOffset OccurredAt { get; private set; }

    /// <summary>Free text for humans, e.g. "Approved by Ayesha Perera". Never secrets or tokens.</summary>
    public string? Details { get; private set; }

    /// <summary>user_id → USER: who did it. Null when nobody was signed in (e.g. a failed sign-in for an unknown email).</summary>
    public Guid? UserId { get; private set; }

    /// <summary>Not in the EER; the client's IP address, useful when investigating sign-ins.</summary>
    public string? IpAddress { get; private set; }
}

/// <summary>Values of AUDIT_LOG.action.</summary>
internal static class AuditActions
{
    public const string Login = "LOGIN";
    public const string LoginFailed = "LOGIN_FAILED";
    public const string LockedOut = "LOCKED_OUT";
    public const string Logout = "LOGOUT";

    /// <summary>A rotated-out refresh token was used again; the whole session was ended.</summary>
    public const string RefreshTokenReuse = "REFRESH_TOKEN_REUSE";

    public const string PasswordResetRequested = "PASSWORD_RESET_REQUESTED";
    public const string PasswordReset = "PASSWORD_RESET";

    public const string ApplicationSubmitted = "APPLICATION_SUBMITTED";
    public const string EmailVerified = "EMAIL_VERIFIED";
    public const string ApplicationApproved = "APPLICATION_APPROVED";
    public const string ApplicationRejected = "APPLICATION_REJECTED";
    public const string AccountActivated = "ACCOUNT_ACTIVATED";

    public const string AccountDeactivated = "ACCOUNT_DEACTIVATED";
    public const string AccountReactivated = "ACCOUNT_REACTIVATED";

    public const string ProfileChangeRequested = "PROFILE_CHANGE_REQUESTED";
    public const string ProfileChangeApproved = "PROFILE_CHANGE_APPROVED";
    public const string ProfileChangeRejected = "PROFILE_CHANGE_REJECTED";
}

/// <summary>Values of AUDIT_LOG.entity_type.</summary>
internal static class AuditEntityTypes
{
    public const string User = "User";
    public const string UserApplication = "UserApplication";
    public const string ProfileChangeRequest = "ProfileChangeRequest";
}
