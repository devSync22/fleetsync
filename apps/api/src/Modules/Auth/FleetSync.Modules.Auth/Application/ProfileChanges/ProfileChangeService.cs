using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Applications;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using FleetSync.Modules.Auth.Domain.Roles;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Application.ProfileChanges;

/// <summary>
/// PROFILE_CHANGE_REQUEST: users ask to change an account detail; a Fleet
/// Administrator approves (the change is applied) or rejects it.
/// </summary>
internal sealed class ProfileChangeService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    IEmailSender emailSender,
    AuthEmails emails,
    AuditTrail audit,
    TimeProvider clock)
{
    private const int MaxPageSize = 100;

    /// <summary>Fields that only exist on a DRIVER row.</summary>
    private static readonly HashSet<ProfileField> DriverFields =
        [ProfileField.LicenceNumber, ProfileField.LicenceClass, ProfileField.LicenceExpiry];

    public async Task<Result<ProfileChangeResponse>> RequestAsync(
        Guid userId,
        CreateProfileChangeRequest request,
        CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return AuthErrors.UserNotFound;
        }

        ApiEnum.TryParse<ProfileField>(request.Field, out var field);
        var driver = await db.Drivers.SingleOrDefaultAsync(d => d.UserId == userId, cancellationToken);
        if (DriverFields.Contains(field) && driver is null)
        {
            return AuthErrors.ProfileFieldNotAllowed(ApiEnum.ToApiString(field));
        }

        var newValue = Normalize(field, request.NewValue);
        var oldValue = CurrentValue(field, user, driver);
        if (string.Equals(oldValue, newValue, StringComparison.OrdinalIgnoreCase))
        {
            return AuthErrors.ProfileChangeNoChange;
        }

        // Fail early on values that couldn't be applied anyway.
        var conflict = await FindConflictAsync(field, newValue, userId, cancellationToken);
        if (conflict is not null)
        {
            return conflict;
        }

        if (await db.ProfileChangeRequests.AnyAsync(
                r => r.UserId == userId && r.Field == field && r.Status == ProfileChangeStatus.Pending,
                cancellationToken))
        {
            return AuthErrors.ProfileChangeDuplicate;
        }

        var change = new ProfileChangeRequest(userId, field, oldValue, newValue, clock.GetUtcNow());
        db.ProfileChangeRequests.Add(change);
        audit.Record(AuditActions.ProfileChangeRequested, AuditEntityTypes.ProfileChangeRequest, change.Id.ToString(),
            userId, ApiEnum.ToApiString(field));

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Two identical requests at the same moment: the partial unique index let only one in.
            return AuthErrors.ProfileChangeDuplicate;
        }

        return ToResponse(change, user);
    }

    /// <summary>The signed-in user's own requests, newest first.</summary>
    public async Task<IReadOnlyList<ProfileChangeResponse>> ListMineAsync(Guid userId, CancellationToken cancellationToken) =>
        await Query()
            .Where(x => x.Request.UserId == userId)
            .OrderByDescending(x => x.Request.RequestedAt)
            .Select(x => ToResponse(x.Request, x.User))
            .ToListAsync(cancellationToken);

    /// <summary>Reviewer list, oldest pending first so nothing waits forever.</summary>
    public async Task<PagedResponse<ProfileChangeResponse>> ListAsync(
        ProfileChangeStatus? status,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = Query();
        if (status is not null)
        {
            query = query.Where(x => x.Request.Status == status);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.Request.RequestedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToResponse(x.Request, x.User))
            .ToListAsync(cancellationToken);

        return new PagedResponse<ProfileChangeResponse>(items, page, pageSize, total);
    }

    /// <summary>Approves the request and applies the new value to the account.</summary>
    public async Task<Result<ProfileChangeResponse>> ApproveAsync(Guid id, Guid reviewerId, CancellationToken cancellationToken)
    {
        var loaded = await LoadForReviewAsync(id, reviewerId, cancellationToken);
        if (!loaded.IsSuccess)
        {
            return loaded.Error;
        }

        var (change, user) = loaded.Value;

        // The value may have become unavailable since the request was made.
        var conflict = await FindConflictAsync(change.Field, change.NewValue, user.Id, cancellationToken);
        if (conflict is not null)
        {
            return conflict;
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var applied = await ApplyAsync(change, user, cancellationToken);
        if (!applied.IsSuccess)
        {
            return applied.Error;
        }

        change.Approve(reviewerId, clock.GetUtcNow());
        audit.Record(AuditActions.ProfileChangeApproved, AuditEntityTypes.ProfileChangeRequest, change.Id.ToString(),
            reviewerId, ApiEnum.ToApiString(change.Field));

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        await emailSender.SendAsync(
            emails.ProfileChangeApproved(user.Email!, FirstName(user), Label(change.Field)), cancellationToken);
        return ToResponse(change, user);
    }

    public async Task<Result<ProfileChangeResponse>> RejectAsync(
        Guid id,
        Guid reviewerId,
        RejectProfileChangeRequest request,
        CancellationToken cancellationToken)
    {
        var loaded = await LoadForReviewAsync(id, reviewerId, cancellationToken);
        if (!loaded.IsSuccess)
        {
            return loaded.Error;
        }

        var (change, user) = loaded.Value;
        var reason = request.Reason.Trim();

        change.Reject(reviewerId, reason, clock.GetUtcNow());
        audit.Record(AuditActions.ProfileChangeRejected, AuditEntityTypes.ProfileChangeRequest, change.Id.ToString(),
            reviewerId, reason);
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(
            emails.ProfileChangeRejected(user.Email!, FirstName(user), Label(change.Field), reason), cancellationToken);
        return ToResponse(change, user);
    }

    private async Task<Result> ApplyAsync(ProfileChangeRequest change, ApplicationUser user, CancellationToken cancellationToken)
    {
        switch (change.Field)
        {
            case ProfileField.FullName:
                user.FullName = change.NewValue;
                return ToResult(await userManager.UpdateAsync(user));

            case ProfileField.Phone:
                user.PhoneNumber = change.NewValue;
                return ToResult(await userManager.UpdateAsync(user));

            case ProfileField.Email:
                // The email is also the user name. SetEmailAsync clears EmailConfirmed;
                // an administrator approved the address, so it is confirmed again.
                var email = await userManager.SetEmailAsync(user, change.NewValue);
                if (!email.Succeeded)
                {
                    return IdentityErrorMapper.ToAuthError(email);
                }

                user.EmailConfirmed = true;
                return ToResult(await userManager.SetUserNameAsync(user, change.NewValue));

            default:
                var driver = await db.Drivers.SingleAsync(d => d.UserId == user.Id, cancellationToken);
                switch (change.Field)
                {
                    case ProfileField.LicenceNumber:
                        driver.ChangeLicence(number: change.NewValue);
                        break;
                    case ProfileField.LicenceClass:
                        ApiEnum.TryParse<LicenceClass>(change.NewValue, out var licenceClass);
                        driver.ChangeLicence(licenceClass: licenceClass);
                        break;
                    case ProfileField.LicenceExpiry:
                        FieldRules.TryParseDate(change.NewValue, out var expiry);
                        driver.ChangeLicence(expiry: expiry);
                        break;
                }

                return Result.Success();
        }
    }

    /// <summary>An error if the new email or licence number already belongs to someone else.</summary>
    private async Task<AuthError?> FindConflictAsync(
        ProfileField field,
        string newValue,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (field == ProfileField.Email)
        {
            var owner = await userManager.FindByEmailAsync(newValue);
            return owner is not null && owner.Id != userId ? AuthErrors.EmailAlreadyRegistered : null;
        }

        if (field == ProfileField.LicenceNumber
            && await db.Drivers.AnyAsync(d => d.LicenceNumber == newValue && d.UserId != userId, cancellationToken))
        {
            return AuthErrors.LicenceTaken;
        }

        return null;
    }

    private async Task<Result<(ProfileChangeRequest Change, ApplicationUser User)>> LoadForReviewAsync(
        Guid id,
        Guid reviewerId,
        CancellationToken cancellationToken)
    {
        var change = await db.ProfileChangeRequests.SingleOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (change is null)
        {
            return AuthErrors.ProfileChangeNotFound;
        }

        if (change.Status != ProfileChangeStatus.Pending)
        {
            return AuthErrors.ProfileChangeNotPending(ApiEnum.ToApiString(change.Status));
        }

        // Four-eyes rule: nobody approves changes to their own account.
        if (change.UserId == reviewerId)
        {
            return AuthErrors.ProfileChangeSelfReview;
        }

        var user = await userManager.FindByIdAsync(change.UserId.ToString());
        return user is null ? AuthErrors.UserNotFound : (change, user);
    }

    /// <summary>Requests joined with their account, for responses that show who asked.</summary>
    /// <remarks>
    /// A member-initialised class (not a tuple) so EF Core can translate
    /// Where/OrderBy on it; the final ToResponse runs in memory.
    /// </remarks>
    private IQueryable<RequestRow> Query() =>
        db.ProfileChangeRequests.AsNoTracking()
            .Join(db.Users.AsNoTracking(), r => r.UserId, u => u.Id, (r, u) => new RequestRow { Request = r, User = u });

    private sealed class RequestRow
    {
        public required ProfileChangeRequest Request { get; init; }

        public required ApplicationUser User { get; init; }
    }

    /// <summary>The value as it should be stored: same formats the account itself uses.</summary>
    private static string Normalize(ProfileField field, string value) => field switch
    {
        ProfileField.Phone => FieldRules.NormalizeMobile(value),
        ProfileField.Email => FieldRules.NormalizeEmail(value),
        ProfileField.LicenceNumber => value.Trim().ToUpperInvariant(),
        ProfileField.LicenceClass => ApiEnum.TryParse<LicenceClass>(value, out var c) ? ApiEnum.ToApiString(c) : value.Trim(),
        _ => value.Trim(),
    };

    private static string? CurrentValue(ProfileField field, ApplicationUser user, Driver? driver) => field switch
    {
        ProfileField.FullName => user.FullName,
        ProfileField.Phone => user.PhoneNumber,
        ProfileField.Email => user.Email,
        ProfileField.LicenceNumber => driver?.LicenceNumber,
        ProfileField.LicenceClass => driver is null ? null : ApiEnum.ToApiString(driver.LicenceClass),
        ProfileField.LicenceExpiry => driver?.LicenceExpiry?.ToString("yyyy-MM-dd"),
        _ => null,
    };

    /// <summary>"licence-number" → "licence number", for emails.</summary>
    private static string Label(ProfileField field) => ApiEnum.ToApiString(field).Replace('-', ' ');

    private static string FirstName(ApplicationUser user) =>
        user.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? user.FullName;

    private static Result ToResult(IdentityResult result) =>
        result.Succeeded ? Result.Success() : IdentityErrorMapper.ToAuthError(result);

    private static ProfileChangeResponse ToResponse(ProfileChangeRequest r, ApplicationUser u) => new(
        r.Id, r.UserId, u.FullName, u.Email ?? string.Empty, r.Field, r.OldValue, r.NewValue,
        r.Status, r.RequestedAt, r.ReviewedAt, r.RejectionReason);
}
