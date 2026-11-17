namespace FleetSync.Modules.Auth.Domain.ProfileChanges;

/// <summary>PROFILE_CHANGE_REQUEST.request_status.</summary>
internal enum ProfileChangeStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
}

/// <summary>
/// The account details a user may ask to change (field_name). Each needs a
/// Fleet Administrator's approval before it is applied.
/// Serialized as "full-name", "phone", "email", "licence-number", "licence-class", "licence-expiry".
/// </summary>
internal enum ProfileField
{
    FullName = 1,
    Phone = 2,
    Email = 3,

    /// <summary>Drivers only.</summary>
    LicenceNumber = 4,

    /// <summary>Drivers only.</summary>
    LicenceClass = 5,

    /// <summary>Drivers only (yyyy-MM-dd).</summary>
    LicenceExpiry = 6,
}

/// <summary>
/// PROFILE_CHANGE_REQUEST: a change to one account detail that waits for a
/// Fleet Administrator. Old and new values are kept as text so the review
/// screen and the history read the same for every field.
/// </summary>
internal sealed class ProfileChangeRequest
{
    // Required by EF Core.
    private ProfileChangeRequest()
    {
    }

    public ProfileChangeRequest(Guid userId, ProfileField field, string? oldValue, string newValue, DateTimeOffset requestedAt)
    {
        Id = Guid.CreateVersion7();
        UserId = userId;
        Field = field;
        OldValue = oldValue;
        NewValue = newValue;
        Status = ProfileChangeStatus.Pending;
        RequestedAt = requestedAt;
    }

    public Guid Id { get; private set; }

    /// <summary>The account to change.</summary>
    public Guid UserId { get; private set; }

    /// <summary>field_name.</summary>
    public ProfileField Field { get; private set; }

    /// <summary>The value when the request was made (null if the field was empty).</summary>
    public string? OldValue { get; private set; }

    public string NewValue { get; private set; } = string.Empty;

    public ProfileChangeStatus Status { get; private set; }

    public DateTimeOffset RequestedAt { get; private set; }

    public DateTimeOffset? ReviewedAt { get; private set; }

    /// <summary>
    /// approved_by → FLEET_ADMINISTRATOR. Also set on rejection, so it always
    /// names the administrator who decided.
    /// </summary>
    public Guid? ApprovedByUserId { get; private set; }

    /// <summary>Not in the EER; tells the user why a change was declined.</summary>
    public string? RejectionReason { get; private set; }

    public void Approve(Guid reviewerId, DateTimeOffset now)
    {
        EnsurePending();
        Status = ProfileChangeStatus.Approved;
        ApprovedByUserId = reviewerId;
        ReviewedAt = now;
    }

    public void Reject(Guid reviewerId, string reason, DateTimeOffset now)
    {
        EnsurePending();
        Status = ProfileChangeStatus.Rejected;
        ApprovedByUserId = reviewerId;
        RejectionReason = reason;
        ReviewedAt = now;
    }

    private void EnsurePending()
    {
        if (Status != ProfileChangeStatus.Pending)
        {
            throw new InvalidOperationException($"Profile change request {Id} is {Status}, expected Pending.");
        }
    }
}
