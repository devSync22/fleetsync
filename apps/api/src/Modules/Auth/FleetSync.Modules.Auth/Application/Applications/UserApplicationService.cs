using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Registration;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Domain.Roles;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Auth.Infrastructure.Storage;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Applications;

/// <summary>A stored document opened for download.</summary>
internal sealed record DocumentDownload(Stream Content, string ContentType, string FileName);

/// <summary>
/// USER_APPLICATION: staff submission (customers submit through
/// CustomerRegistrationService), then review — list, inspect, approve,
/// reject — by a Fleet Administrator, for every role.
/// </summary>
internal sealed class UserApplicationService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    RoleAssignment roles,
    IDocumentStorage storage,
    IReferenceNumberGenerator references,
    IEmailSender emailSender,
    AuthEmails emails,
    AuditTrail audit,
    IOptions<AuthOptions> options,
    TimeProvider clock)
{
    private const int MaxPageSize = 100;

    /// <summary>Saves the files, then the application. Expects an already-validated command.</summary>
    public async Task<Result<RegistrationSubmittedResponse>> SubmitStaffAsync(
        SubmitStaffApplicationCommand command,
        CancellationToken cancellationToken)
    {
        var form = command.Form;
        var email = FieldRules.NormalizeEmail(form.Email);
        var normalizedEmail = UserApplication.NormalizeEmail(email);
        var nic = FieldRules.NormalizeNic(form.Nic);
        SubmitStaffApplicationCommandValidator.TryParseStaffRole(form.Role, out var role);
        var licenceNumber = role == ApplicantRole.Driver ? form.LicenceNumber?.Trim().ToUpperInvariant() : null;

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        // Pending or approved-but-not-activated applications block a new one with the same email or NIC.
        var hasOpenApplication = await db.UserApplications.AnyAsync(
            a => (a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved)
                 && (a.NormalizedEmail == normalizedEmail || a.Nic == nic),
            cancellationToken);
        if (hasOpenApplication)
        {
            return AuthErrors.ApplicationDuplicate;
        }

        if (licenceNumber is not null && await db.Drivers.AnyAsync(d => d.LicenceNumber == licenceNumber, cancellationToken))
        {
            return AuthErrors.LicenceTaken;
        }

        var now = clock.GetUtcNow();
        var savedKeys = new List<string>();

        try
        {
            var documents = new List<ApplicationDocument>();
            foreach (var file in command.Documents)
            {
                var saved = await SaveDocumentAsync(file, now, cancellationToken);
                if (!saved.IsSuccess)
                {
                    await DeleteFilesAsync(savedKeys);
                    return saved.Error;
                }

                savedKeys.Add(saved.Value.StorageKey);
                documents.Add(saved.Value);
            }

            LicenceClass? licenceClass = ApiEnum.TryParse<LicenceClass>(form.LicenceClass, out var parsedClass)
                ? parsedClass
                : null;
            DateOnly? licenceExpiry = FieldRules.TryParseDate(form.LicenceExpiry, out var expiry) ? expiry : null;

            var application = UserApplication.ForStaff(
                await references.NextRegistrationReferenceAsync(cancellationToken),
                string.IsNullOrWhiteSpace(form.ApplicationFormCode) ? null : form.ApplicationFormCode.Trim().ToUpperInvariant(),
                role,
                form.FullName.Trim(),
                nic,
                email,
                FieldRules.NormalizeMobile(form.Mobile),
                licenceNumber,
                licenceClass,
                licenceExpiry,
                documents,
                now);

            db.UserApplications.Add(application);
            audit.Record(AuditActions.ApplicationSubmitted, AuditEntityTypes.UserApplication, application.Id.ToString(),
                userId: null, $"{application.Reference}, role {ApiEnum.ToApiString(role)}");
            await db.SaveChangesAsync(cancellationToken);

            await emailSender.SendAsync(
                emails.ApplicationReceived(email, application.FirstName, application.Reference),
                cancellationToken);

            return new RegistrationSubmittedResponse(application.Reference, email, now);
        }
        catch
        {
            // Don't leave orphaned files behind if the database write fails.
            await DeleteFilesAsync(savedKeys);
            throw;
        }
    }

    public async Task<PagedResponse<ApplicationSummaryResponse>> ListAsync(
        ApplicationStatus? status,
        ApplicantRole? role,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = db.UserApplications.AsNoTracking();
        if (status is not null)
        {
            query = query.Where(a => a.Status == status);
        }

        if (role is not null)
        {
            query = query.Where(a => a.RequestedRole == role);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ApplicationSummaryResponse(
                a.Id, a.Reference, a.FullName, a.Email, a.RequestedRole, a.Status, a.EmailVerifiedAt != null, a.SubmittedAt))
            .ToListAsync(cancellationToken);

        return new PagedResponse<ApplicationSummaryResponse>(items, page, pageSize, total);
    }

    public async Task<Result<ApplicationDetailsResponse>> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await db.UserApplications
            .AsNoTracking()
            .Include(a => a.Documents)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

        return application is null ? AuthErrors.ApplicationNotFound : ToDetails(application);
    }

    public async Task<Result<DocumentDownload>> OpenDocumentAsync(
        Guid applicationId,
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var document = await db.ApplicationDocuments
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == documentId && d.ApplicationId == applicationId, cancellationToken);
        if (document is null)
        {
            return AuthErrors.DocumentNotFound;
        }

        var stream = await storage.OpenReadAsync(document.StorageKey, cancellationToken);
        return stream is null
            ? AuthErrors.DocumentNotFound
            : new DocumentDownload(stream, document.ContentType, document.FileName);
    }

    /// <summary>
    /// Customers: creates the account (with the password chosen at registration)
    /// and they can sign in straight away. Staff: emails a link to create their password.
    /// </summary>
    public async Task<Result<ApplicationDetailsResponse>> ApproveAsync(
        Guid id,
        Guid reviewerId,
        CancellationToken cancellationToken)
    {
        var loaded = await LoadForReviewAsync(id, cancellationToken);
        if (!loaded.IsSuccess)
        {
            return loaded.Error;
        }

        var app = loaded.Value;

        // Someone may have registered with this email since the application was sent.
        if (await userManager.FindByEmailAsync(app.Email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        var reviewerName = await GetReviewerNameAsync(reviewerId);
        var result = app.RequestedRole == ApplicantRole.Customer
            ? await ApproveCustomerAsync(app, reviewerId, reviewerName, cancellationToken)
            : await ApproveStaffAsync(app, reviewerId, reviewerName, cancellationToken);

        return result.IsSuccess ? ToDetails(app) : result.Error;
    }

    public async Task<Result<ApplicationDetailsResponse>> RejectAsync(
        Guid id,
        Guid reviewerId,
        RejectApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var loaded = await LoadForReviewAsync(id, cancellationToken);
        if (!loaded.IsSuccess)
        {
            return loaded.Error;
        }

        var app = loaded.Value;
        var reason = request.Reason.Trim();
        app.Reject(reviewerId, await GetReviewerNameAsync(reviewerId), reason, clock.GetUtcNow());
        audit.Record(AuditActions.ApplicationRejected, AuditEntityTypes.UserApplication, app.Id.ToString(), reviewerId, reason);

        var saved = await SaveReviewAsync(cancellationToken);
        if (!saved.IsSuccess)
        {
            return saved.Error;
        }

        await emailSender.SendAsync(
            emails.ApplicationRejected(app.Email, app.FirstName, app.Reference, reason), cancellationToken);
        return ToDetails(app);
    }

    private async Task<Result> ApproveCustomerAsync(
        UserApplication app,
        Guid reviewerId,
        string reviewerName,
        CancellationToken cancellationToken)
    {
        if (!app.IsEmailVerified)
        {
            return AuthErrors.ApplicationEmailNotVerified;
        }

        var now = clock.GetUtcNow();
        var user = new ApplicationUser
        {
            UserName = app.Email,
            Email = app.Email,
            // The applicant opened the verification link before approval.
            EmailConfirmed = true,
            FullName = app.FullName,
            PhoneNumber = app.Mobile,
            // The password chosen at registration; its policy was checked then.
            PasswordHash = app.PasswordHash,
            CreatedAt = now,
        };

        // Account, role, company and the application's new state commit together or not at all.
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var created = await userManager.CreateAsync(user);
        if (!created.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(created);
        }

        var company = await FindOrAddCompanyAsync(app, now, cancellationToken);
        var assigned = await roles.AssignFromApplicationAsync(user, app, company.Id);
        if (!assigned.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(assigned);
        }

        app.ApproveCustomer(reviewerId, reviewerName, user.Id, now);
        audit.Record(AuditActions.ApplicationApproved, AuditEntityTypes.UserApplication, app.Id.ToString(), reviewerId,
            $"Customer account {user.Id} created");

        var saved = await SaveReviewAsync(cancellationToken);
        if (!saved.IsSuccess)
        {
            return saved;
        }

        await transaction.CommitAsync(cancellationToken);
        await emailSender.SendAsync(emails.CustomerApproved(app.Email, app.FirstName), cancellationToken);
        return Result.Success();
    }

    private async Task<Result> ApproveStaffAsync(
        UserApplication app,
        Guid reviewerId,
        string reviewerName,
        CancellationToken cancellationToken)
    {
        // Another driver may have registered this licence since the application was sent.
        if (app.LicenceNumber is not null
            && await db.Drivers.AnyAsync(d => d.LicenceNumber == app.LicenceNumber, cancellationToken))
        {
            return AuthErrors.LicenceTaken;
        }

        var token = SecureToken.Generate();
        app.ApproveStaff(
            reviewerId,
            reviewerName,
            SecureToken.Hash(token),
            clock.GetUtcNow(),
            TimeSpan.FromDays(options.Value.Tokens.StaffActivationDays));
        audit.Record(AuditActions.ApplicationApproved, AuditEntityTypes.UserApplication, app.Id.ToString(), reviewerId,
            "Activation link sent");

        var saved = await SaveReviewAsync(cancellationToken);
        if (!saved.IsSuccess)
        {
            return saved;
        }

        await emailSender.SendAsync(emails.StaffApplicationApproved(app.Email, app.FirstName, token), cancellationToken);
        return Result.Success();
    }

    /// <summary>A new contact for a known business registration number joins the existing company.</summary>
    private async Task<CustomerCompany> FindOrAddCompanyAsync(UserApplication app, DateTimeOffset now, CancellationToken cancellationToken)
    {
        var normalized = CustomerCompany.NormalizeRegistrationNo(app.BusinessRegistrationNo!);
        var existing = await db.CustomerCompanies
            .SingleOrDefaultAsync(c => c.NormalizedBusinessRegistrationNo == normalized, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var company = new CustomerCompany(app.CompanyName!, app.BusinessRegistrationNo!, app.BillingAddress!, now);
        db.CustomerCompanies.Add(company);
        return company;
    }

    private async Task<Result<ApplicationDocument>> SaveDocumentAsync(
        UploadedDocument file,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var fileName = DocumentInspector.SanitizeFileName(file.FileName);

        // Read the first bytes to learn the real type; never trust the extension alone.
        DetectedFileType? detected;
        await using (var header = file.OpenReadStream())
        {
            detected = await DocumentInspector.DetectAsync(header, cancellationToken);
        }

        if (detected is null)
        {
            return AuthErrors.InvalidDocument(fileName, "the file is not a valid PDF or JPG.");
        }

        await using var content = file.OpenReadStream();
        var key = await storage.SaveAsync(content, detected.Extension, cancellationToken);

        return new ApplicationDocument(fileName, detected.ContentType, file.Length, key, now);
    }

    private async Task<Result<UserApplication>> LoadForReviewAsync(Guid id, CancellationToken cancellationToken)
    {
        var app = await db.UserApplications
            .Include(a => a.Documents)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return AuthErrors.ApplicationNotFound;
        }

        return app.Status == ApplicationStatus.Pending
            ? app
            : AuthErrors.ApplicationNotPending(ApiEnum.ToApiString(app.Status));
    }

    private async Task<Result> SaveReviewAsync(CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another administrator reviewed it first.
            return AuthErrors.ApplicationNotPending("already reviewed");
        }
    }

    private async Task<string> GetReviewerNameAsync(Guid reviewerId)
    {
        var reviewer = await userManager.FindByIdAsync(reviewerId.ToString());
        return reviewer?.FullName ?? "Fleet Administrator";
    }

    private async Task DeleteFilesAsync(IEnumerable<string> keys)
    {
        foreach (var key in keys)
        {
            // CancellationToken.None: cleanup must run even if the request was cancelled.
            await storage.DeleteAsync(key, CancellationToken.None);
        }
    }

    private static ApplicationDetailsResponse ToDetails(UserApplication a) => new(
        a.Id,
        a.Reference,
        a.ApplicationFormCode,
        a.RequestedRole,
        a.FullName,
        a.Nic,
        a.Email,
        a.IsEmailVerified,
        a.Mobile,
        a.LicenceNumber,
        a.LicenceClass,
        a.LicenceExpiry,
        a.CompanyName,
        a.BusinessRegistrationNo,
        a.BillingAddress,
        a.Status,
        a.SubmittedAt,
        a.ReviewedAt,
        a.ReviewedByName,
        a.RejectionReason,
        a.ActivatedAt,
        a.UserId,
        a.Documents
            .OrderBy(d => d.UploadedAt)
            .Select(d => new ApplicationDocumentResponse(d.Id, d.FileName, d.ContentType, d.SizeBytes))
            .ToList());
}
