namespace FleetSync.Modules.Auth.Domain.StaffApplications;

/// <summary>
/// A request from a driver, mechanic or coordinator for a staff account.
///
/// Lifecycle: Pending → (Approved → Activated) or Rejected.
/// The account itself is only created at activation, when the applicant
/// opens the emailed link and chooses a password.
/// </summary>
internal sealed class StaffApplication
{
    private readonly List<StaffApplicationDocument> _documents = [];

    // Required by EF Core.
    private StaffApplication()
    {
    }

    public StaffApplication(
        string reference,
        string? applicationFormCode,
        string fullName,
        string nic,
        string email,
        string mobile,
        StaffRole role,
        string? licenceNumber,
        LicenceClass? licenceClass,
        IEnumerable<StaffApplicationDocument> documents,
        DateTimeOffset submittedAt)
    {
        Id = Guid.CreateVersion7();
        Reference = reference;
        ApplicationFormCode = applicationFormCode;
        FullName = fullName;
        Nic = nic;
        Email = email;
        NormalizedEmail = NormalizeEmail(email);
        Mobile = mobile;
        Role = role;

        // Licence details only make sense for drivers; drop them for other roles.
        LicenceNumber = role == StaffRole.Driver ? licenceNumber : null;
        LicenceClass = role == StaffRole.Driver ? licenceClass : null;

        Status = StaffApplicationStatus.Pending;
        SubmittedAt = submittedAt;
        _documents.AddRange(documents);
    }

    public Guid Id { get; private set; }

    /// <summary>Reference shown to the applicant, e.g. "REG-2026-0142".</summary>
    public string Reference { get; private set; } = string.Empty;

    /// <summary>Code of the admin-generated form this was submitted from, if any (e.g. "APP-2026-0124").</summary>
    public string? ApplicationFormCode { get; private set; }

    public string FullName { get; private set; } = string.Empty;

    /// <summary>Sri Lankan NIC, stored upper-case (e.g. "199012345678" or "901234567V").</summary>
    public string Nic { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    /// <summary>Upper-case email used for duplicate checks (same convention as Identity).</summary>
    public string NormalizedEmail { get; private set; } = string.Empty;

    /// <summary>Mobile number in +94 format, e.g. "+94771234567".</summary>
    public string Mobile { get; private set; } = string.Empty;

    public StaffRole Role { get; private set; }

    public string? LicenceNumber { get; private set; }

    public LicenceClass? LicenceClass { get; private set; }

    public StaffApplicationStatus Status { get; private set; }

    public DateTimeOffset SubmittedAt { get; private set; }

    public DateTimeOffset? ReviewedAt { get; private set; }

    public Guid? ReviewedByUserId { get; private set; }

    /// <summary>Reviewer's name at review time, e.g. "Ayesha Perera" (shown on the activation screen).</summary>
    public string? ReviewedByName { get; private set; }

    public string? RejectionReason { get; private set; }

    /// <summary>SHA-256 hash of the activation token; cleared once used.</summary>
    public string? ActivationTokenHash { get; private set; }

    public DateTimeOffset? ActivationTokenExpiresAt { get; private set; }

    public DateTimeOffset? ActivatedAt { get; private set; }

    /// <summary>The staff account created at activation.</summary>
    public Guid? UserId { get; private set; }

    public IReadOnlyCollection<StaffApplicationDocument> Documents => _documents.AsReadOnly();

    /// <summary>The first word of the full name, for "Hi Tharindu" style greetings.</summary>
    public string FirstName => FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? FullName;

    /// <summary>
    /// Approves the application and stores the hash of the activation token
    /// that will be emailed to the applicant.
    /// </summary>
    public void Approve(
        Guid reviewerId,
        string reviewerName,
        string activationTokenHash,
        DateTimeOffset now,
        TimeSpan activationLifetime)
    {
        EnsureStatus(StaffApplicationStatus.Pending);

        Status = StaffApplicationStatus.Approved;
        ReviewedAt = now;
        ReviewedByUserId = reviewerId;
        ReviewedByName = reviewerName;
        ActivationTokenHash = activationTokenHash;
        ActivationTokenExpiresAt = now + activationLifetime;
    }

    /// <summary>Declines the application with a reason the applicant will see.</summary>
    public void Reject(Guid reviewerId, string reviewerName, string reason, DateTimeOffset now)
    {
        EnsureStatus(StaffApplicationStatus.Pending);

        Status = StaffApplicationStatus.Rejected;
        ReviewedAt = now;
        ReviewedByUserId = reviewerId;
        ReviewedByName = reviewerName;
        RejectionReason = reason;
    }

    /// <summary>True when the activation link can still be used.</summary>
    public bool CanActivate(DateTimeOffset now) =>
        Status == StaffApplicationStatus.Approved
        && ActivationTokenHash is not null
        && ActivationTokenExpiresAt > now;

    /// <summary>Links the new staff account and invalidates the activation link.</summary>
    public void MarkActivated(Guid userId, DateTimeOffset now)
    {
        if (!CanActivate(now))
        {
            throw new InvalidOperationException("The application cannot be activated.");
        }

        Status = StaffApplicationStatus.Activated;
        UserId = userId;
        ActivatedAt = now;
        ActivationTokenHash = null;
        ActivationTokenExpiresAt = null;
    }

    /// <summary>Upper-cases an email the same way ASP.NET Core Identity does.</summary>
    public static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private void EnsureStatus(StaffApplicationStatus expected)
    {
        if (Status != expected)
        {
            throw new InvalidOperationException(
                $"Staff application {Reference} is {Status}, expected {expected}.");
        }
    }
}
