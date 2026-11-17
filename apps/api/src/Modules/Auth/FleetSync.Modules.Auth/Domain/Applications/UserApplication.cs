namespace FleetSync.Modules.Auth.Domain.Applications;

/// <summary>
/// USER_APPLICATION: a sign-up request that a Fleet Administrator approves.
///
/// Customers: Pending (verify email) → Approved (account created, can sign in) or Rejected.
///   The password is chosen on the registration form; only its hash is kept
///   here until the review, then it moves to the account (or is discarded).
///
/// Staff (driver, mechanic, coordinator, owner): Pending → Approved → Activated, or Rejected.
///   The account is created at activation, when the applicant opens the
///   emailed link and chooses a password.
///
/// <see cref="UserId"/> is set once the account exists.
/// </summary>
internal sealed class UserApplication
{
    private readonly List<ApplicationDocument> _documents = [];

    // Required by EF Core.
    private UserApplication()
    {
    }

    private UserApplication(
        string reference,
        ApplicantRole role,
        string fullName,
        string email,
        string mobile,
        DateTimeOffset submittedAt)
    {
        Id = Guid.CreateVersion7();
        Reference = reference;
        RequestedRole = role;
        FullName = fullName;
        Email = email;
        NormalizedEmail = NormalizeEmail(email);
        Mobile = mobile;
        Status = ApplicationStatus.Pending;
        SubmittedAt = submittedAt;
    }

    /// <summary>A customer company's contact person, from the registration form.</summary>
    public static UserApplication ForCustomer(
        string reference,
        string fullName,
        string email,
        string mobile,
        string companyName,
        string businessRegistrationNo,
        string billingAddress,
        string passwordHash,
        string emailVerificationTokenHash,
        DateTimeOffset now,
        TimeSpan verificationLifetime) =>
        new(reference, ApplicantRole.Customer, fullName, email, mobile, now)
        {
            CompanyName = companyName,
            BusinessRegistrationNo = businessRegistrationNo,
            BillingAddress = billingAddress,
            PasswordHash = passwordHash,
            EmailVerificationTokenHash = emailVerificationTokenHash,
            EmailVerificationTokenExpiresAt = now + verificationLifetime,
        };

    /// <summary>A staff member (driver, mechanic, coordinator or owner), from the staff form.</summary>
    public static UserApplication ForStaff(
        string reference,
        string? applicationFormCode,
        ApplicantRole role,
        string fullName,
        string nic,
        string email,
        string mobile,
        string? licenceNumber,
        LicenceClass? licenceClass,
        DateOnly? licenceExpiry,
        IEnumerable<ApplicationDocument> documents,
        DateTimeOffset now)
    {
        if (!role.IsStaff())
        {
            throw new ArgumentException("Customers apply with ForCustomer.", nameof(role));
        }

        var application = new UserApplication(reference, role, fullName, email, mobile, now)
        {
            ApplicationFormCode = applicationFormCode,
            Nic = nic,

            // Licence details only make sense for drivers; drop them for other roles.
            LicenceNumber = role == ApplicantRole.Driver ? licenceNumber : null,
            LicenceClass = role == ApplicantRole.Driver ? licenceClass : null,
            LicenceExpiry = role == ApplicantRole.Driver ? licenceExpiry : null,

            // Opening the emailed activation link later proves the address, so staff
            // applications don't need a separate verification step.
            EmailVerifiedAt = now,
        };

        application._documents.AddRange(documents);
        return application;
    }

    public Guid Id { get; private set; }

    /// <summary>Reference shown to the applicant, e.g. "REG-2026-0142".</summary>
    public string Reference { get; private set; } = string.Empty;

    /// <summary>Code of the admin-generated form this was submitted from, if any (e.g. "APP-2026-0124").</summary>
    public string? ApplicationFormCode { get; private set; }

    /// <summary>applicant_name.</summary>
    public string FullName { get; private set; } = string.Empty;

    /// <summary>Sri Lankan NIC, stored upper-case. Staff only (the customer form has no NIC).</summary>
    public string? Nic { get; private set; }

    /// <summary>applicant_email.</summary>
    public string Email { get; private set; } = string.Empty;

    /// <summary>Upper-case email used for duplicate checks (same convention as Identity).</summary>
    public string NormalizedEmail { get; private set; } = string.Empty;

    /// <summary>applicant_phone, in +94 format, e.g. "+94771234567".</summary>
    public string Mobile { get; private set; } = string.Empty;

    public ApplicantRole RequestedRole { get; private set; }

    /// <summary>Drivers only.</summary>
    public string? LicenceNumber { get; private set; }

    /// <summary>Drivers only.</summary>
    public LicenceClass? LicenceClass { get; private set; }

    /// <summary>Drivers only; optional until the apps collect it.</summary>
    public DateOnly? LicenceExpiry { get; private set; }

    /// <summary>Customers only: becomes a CUSTOMER_COMPANY row on approval.</summary>
    public string? CompanyName { get; private set; }

    /// <summary>Customers only.</summary>
    public string? BusinessRegistrationNo { get; private set; }

    /// <summary>Customers only.</summary>
    public string? BillingAddress { get; private set; }

    /// <summary>
    /// Customers only: hash of the password chosen at registration. Moved to the
    /// account on approval and cleared on approval or rejection.
    /// </summary>
    public string? PasswordHash { get; private set; }

    /// <summary>Customers only: SHA-256 hash of the email verification token; cleared once used.</summary>
    public string? EmailVerificationTokenHash { get; private set; }

    public DateTimeOffset? EmailVerificationTokenExpiresAt { get; private set; }

    /// <summary>When the applicant proved they own the email address.</summary>
    public DateTimeOffset? EmailVerifiedAt { get; private set; }

    public ApplicationStatus Status { get; private set; }

    public DateTimeOffset SubmittedAt { get; private set; }

    public DateTimeOffset? ReviewedAt { get; private set; }

    /// <summary>reviewed_by: the Fleet Administrator who decided.</summary>
    public Guid? ReviewedByUserId { get; private set; }

    /// <summary>Reviewer's name at review time, e.g. "Ayesha Perera" (shown on the activation screen).</summary>
    public string? ReviewedByName { get; private set; }

    public string? RejectionReason { get; private set; }

    /// <summary>Staff only: SHA-256 hash of the activation token; cleared once used.</summary>
    public string? ActivationTokenHash { get; private set; }

    public DateTimeOffset? ActivationTokenExpiresAt { get; private set; }

    public DateTimeOffset? ActivatedAt { get; private set; }

    /// <summary>The account created from this application (set once approved / activated).</summary>
    public Guid? UserId { get; private set; }

    public IReadOnlyCollection<ApplicationDocument> Documents => _documents.AsReadOnly();

    /// <summary>The first word of the full name, for "Hi Tharindu" style greetings.</summary>
    public string FirstName => FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? FullName;

    public bool IsEmailVerified => EmailVerifiedAt is not null;

    /// <summary>True while the verification link can still be used.</summary>
    public bool CanVerifyEmail(DateTimeOffset now) =>
        Status == ApplicationStatus.Pending
        && EmailVerificationTokenHash is not null
        && EmailVerificationTokenExpiresAt > now;

    /// <summary>Customers: replaces the verification link (resend).</summary>
    public void ReissueEmailVerification(string tokenHash, DateTimeOffset now, TimeSpan lifetime)
    {
        EnsureStatus(ApplicationStatus.Pending);
        EmailVerificationTokenHash = tokenHash;
        EmailVerificationTokenExpiresAt = now + lifetime;
    }

    /// <summary>Customers: the emailed link was opened. The application now waits for review.</summary>
    public void MarkEmailVerified(DateTimeOffset now)
    {
        if (!CanVerifyEmail(now))
        {
            throw new InvalidOperationException("The email verification link cannot be used.");
        }

        EmailVerifiedAt = now;
        EmailVerificationTokenHash = null;
        EmailVerificationTokenExpiresAt = null;
    }

    /// <summary>
    /// Customers: approves and links the account created from this application.
    /// The stored password hash has been copied to the account, so it is cleared here.
    /// </summary>
    public void ApproveCustomer(Guid reviewerId, string reviewerName, Guid userId, DateTimeOffset now)
    {
        EnsureStatus(ApplicationStatus.Pending);
        if (RequestedRole.IsStaff())
        {
            throw new InvalidOperationException("Staff applications are approved with ApproveStaff.");
        }

        MarkReviewed(ApplicationStatus.Approved, reviewerId, reviewerName, now);
        UserId = userId;
        PasswordHash = null;
    }

    /// <summary>Staff: approves and stores the hash of the activation token emailed to the applicant.</summary>
    public void ApproveStaff(
        Guid reviewerId,
        string reviewerName,
        string activationTokenHash,
        DateTimeOffset now,
        TimeSpan activationLifetime)
    {
        EnsureStatus(ApplicationStatus.Pending);
        if (!RequestedRole.IsStaff())
        {
            throw new InvalidOperationException("Customer applications are approved with ApproveCustomer.");
        }

        MarkReviewed(ApplicationStatus.Approved, reviewerId, reviewerName, now);
        ActivationTokenHash = activationTokenHash;
        ActivationTokenExpiresAt = now + activationLifetime;
    }

    /// <summary>Declines the application with a reason the applicant will see.</summary>
    public void Reject(Guid reviewerId, string reviewerName, string reason, DateTimeOffset now)
    {
        EnsureStatus(ApplicationStatus.Pending);

        MarkReviewed(ApplicationStatus.Rejected, reviewerId, reviewerName, now);
        RejectionReason = reason;

        // Nothing will ever use these again.
        PasswordHash = null;
        EmailVerificationTokenHash = null;
        EmailVerificationTokenExpiresAt = null;
    }

    /// <summary>Staff: true when the activation link can still be used.</summary>
    public bool CanActivate(DateTimeOffset now) =>
        Status == ApplicationStatus.Approved
        && ActivationTokenHash is not null
        && ActivationTokenExpiresAt > now;

    /// <summary>Staff: links the new account and invalidates the activation link.</summary>
    public void MarkActivated(Guid userId, DateTimeOffset now)
    {
        if (!CanActivate(now))
        {
            throw new InvalidOperationException("The application cannot be activated.");
        }

        Status = ApplicationStatus.Activated;
        UserId = userId;
        ActivatedAt = now;
        ActivationTokenHash = null;
        ActivationTokenExpiresAt = null;
    }

    /// <summary>Upper-cases an email the same way ASP.NET Core Identity does.</summary>
    public static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

    private void MarkReviewed(ApplicationStatus status, Guid reviewerId, string reviewerName, DateTimeOffset now)
    {
        Status = status;
        ReviewedAt = now;
        ReviewedByUserId = reviewerId;
        ReviewedByName = reviewerName;
    }

    private void EnsureStatus(ApplicationStatus expected)
    {
        if (Status != expected)
        {
            throw new InvalidOperationException(
                $"Application {Reference} is {Status}, expected {expected}.");
        }
    }
}
