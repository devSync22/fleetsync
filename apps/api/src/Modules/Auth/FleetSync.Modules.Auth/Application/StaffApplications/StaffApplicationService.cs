using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Registration;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.StaffApplications;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Auth.Infrastructure.Storage;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.StaffApplications;

/// <summary>A stored document opened for download.</summary>
internal sealed record DocumentDownload(Stream Content, string ContentType, string FileName);

/// <summary>
/// Staff account applications: submission by applicants, then review
/// (list, inspect, approve, reject) by a Fleet Administrator.
/// </summary>
internal sealed class StaffApplicationService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    IDocumentStorage storage,
    IReferenceNumberGenerator references,
    IEmailSender emailSender,
    AuthEmails emails,
    IOptions<AuthOptions> options,
    TimeProvider clock)
{
    private const int MaxPageSize = 100;

    /// <summary>Saves the files, then the application. Expects an already-validated command.</summary>
    public async Task<Result<RegistrationSubmittedResponse>> SubmitAsync(
        SubmitStaffApplicationCommand command,
        CancellationToken cancellationToken)
    {
        var form = command.Form;
        var email = FieldRules.NormalizeEmail(form.Email);
        var normalizedEmail = StaffApplication.NormalizeEmail(email);
        var nic = FieldRules.NormalizeNic(form.Nic);

        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        // Pending or approved-but-not-activated applications block a new one with the same email or NIC.
        var hasOpenApplication = await db.StaffApplications.AnyAsync(
            a => (a.Status == StaffApplicationStatus.Pending || a.Status == StaffApplicationStatus.Approved)
                 && (a.NormalizedEmail == normalizedEmail || a.Nic == nic),
            cancellationToken);
        if (hasOpenApplication)
        {
            return AuthErrors.StaffApplicationDuplicate;
        }

        var now = clock.GetUtcNow();
        var savedKeys = new List<string>();

        try
        {
            var documents = new List<StaffApplicationDocument>();
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

            ApiEnum.TryParse<StaffRole>(form.Role, out var role);
            LicenceClass? licenceClass = ApiEnum.TryParse<LicenceClass>(form.LicenceClass, out var parsedClass)
                ? parsedClass
                : null;

            var application = new StaffApplication(
                await references.NextRegistrationReferenceAsync(cancellationToken),
                string.IsNullOrWhiteSpace(form.ApplicationFormCode) ? null : form.ApplicationFormCode.Trim().ToUpperInvariant(),
                form.FullName.Trim(),
                nic,
                email,
                FieldRules.NormalizeMobile(form.Mobile),
                role,
                form.LicenceNumber?.Trim().ToUpperInvariant(),
                licenceClass,
                documents,
                now);

            db.StaffApplications.Add(application);
            await db.SaveChangesAsync(cancellationToken);

            await emailSender.SendAsync(
                emails.StaffApplicationReceived(email, application.FirstName, application.Reference),
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

    public async Task<PagedResponse<StaffApplicationSummaryResponse>> ListAsync(
        StaffApplicationStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = db.StaffApplications.AsNoTracking();
        if (status is not null)
        {
            query = query.Where(a => a.Status == status);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.SubmittedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new StaffApplicationSummaryResponse(
                a.Id, a.Reference, a.FullName, a.Email, a.Role, a.Status, a.SubmittedAt))
            .ToListAsync(cancellationToken);

        return new PagedResponse<StaffApplicationSummaryResponse>(items, page, pageSize, total);
    }

    public async Task<Result<StaffApplicationDetailsResponse>> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await db.StaffApplications
            .AsNoTracking()
            .Include(a => a.Documents)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

        return application is null ? AuthErrors.StaffApplicationNotFound : ToDetails(application);
    }

    public async Task<Result<DocumentDownload>> OpenDocumentAsync(
        Guid applicationId,
        Guid documentId,
        CancellationToken cancellationToken)
    {
        var document = await db.StaffApplicationDocuments
            .AsNoTracking()
            .SingleOrDefaultAsync(d => d.Id == documentId && d.StaffApplicationId == applicationId, cancellationToken);
        if (document is null)
        {
            return AuthErrors.DocumentNotFound;
        }

        var stream = await storage.OpenReadAsync(document.StorageKey, cancellationToken);
        return stream is null
            ? AuthErrors.DocumentNotFound
            : new DocumentDownload(stream, document.ContentType, document.FileName);
    }

    /// <summary>Approves and emails the applicant a link to create their password.</summary>
    public async Task<Result<StaffApplicationDetailsResponse>> ApproveAsync(
        Guid id,
        Guid reviewerId,
        CancellationToken cancellationToken)
    {
        var application = await LoadForReviewAsync(id, cancellationToken);
        if (!application.IsSuccess)
        {
            return application.Error;
        }

        var app = application.Value;

        // Someone may have registered with this email since the application was sent.
        if (await userManager.FindByEmailAsync(app.Email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        var token = SecureToken.Generate();
        app.Approve(
            reviewerId,
            await GetReviewerNameAsync(reviewerId),
            SecureToken.Hash(token),
            clock.GetUtcNow(),
            TimeSpan.FromDays(options.Value.Tokens.StaffActivationDays));

        var saved = await SaveReviewAsync(app, cancellationToken);
        if (!saved.IsSuccess)
        {
            return saved.Error;
        }

        await emailSender.SendAsync(emails.StaffApplicationApproved(app.Email, app.FirstName, token), cancellationToken);
        return ToDetails(app);
    }

    public async Task<Result<StaffApplicationDetailsResponse>> RejectAsync(
        Guid id,
        Guid reviewerId,
        RejectStaffApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var application = await LoadForReviewAsync(id, cancellationToken);
        if (!application.IsSuccess)
        {
            return application.Error;
        }

        var app = application.Value;
        var reason = request.Reason.Trim();
        app.Reject(reviewerId, await GetReviewerNameAsync(reviewerId), reason, clock.GetUtcNow());

        var saved = await SaveReviewAsync(app, cancellationToken);
        if (!saved.IsSuccess)
        {
            return saved.Error;
        }

        await emailSender.SendAsync(
            emails.StaffApplicationRejected(app.Email, app.FirstName, app.Reference, reason), cancellationToken);
        return ToDetails(app);
    }

    private async Task<Result<StaffApplicationDocument>> SaveDocumentAsync(
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

        return new StaffApplicationDocument(fileName, detected.ContentType, file.Length, key, now);
    }

    private async Task<Result<StaffApplication>> LoadForReviewAsync(Guid id, CancellationToken cancellationToken)
    {
        var app = await db.StaffApplications
            .Include(a => a.Documents)
            .SingleOrDefaultAsync(a => a.Id == id, cancellationToken);

        if (app is null)
        {
            return AuthErrors.StaffApplicationNotFound;
        }

        return app.Status == StaffApplicationStatus.Pending
            ? app
            : AuthErrors.StaffApplicationNotPending(ApiEnum.ToApiString(app.Status));
    }

    private async Task<Result> SaveReviewAsync(StaffApplication app, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another administrator reviewed it first.
            return AuthErrors.StaffApplicationNotPending("already reviewed");
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

    private static StaffApplicationDetailsResponse ToDetails(StaffApplication a) => new(
        a.Id,
        a.Reference,
        a.ApplicationFormCode,
        a.FullName,
        a.Nic,
        a.Email,
        a.Mobile,
        a.Role,
        a.LicenceNumber,
        a.LicenceClass,
        a.Status,
        a.SubmittedAt,
        a.ReviewedAt,
        a.ReviewedByName,
        a.RejectionReason,
        a.ActivatedAt,
        a.Documents
            .OrderBy(d => d.UploadedAt)
            .Select(d => new StaffApplicationDocumentResponse(d.Id, d.FileName, d.ContentType, d.SizeBytes))
            .ToList());
}
