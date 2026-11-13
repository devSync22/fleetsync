using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.StaffApplications;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Application.Activation;

/// <summary>
/// Turns an approved staff application into a real account: the applicant
/// opens the emailed link, sees the approval details and chooses a password.
/// </summary>
internal sealed class AccountActivationService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    TimeProvider clock)
{
    public async Task<Result<AccountApprovalResponse>> LookupAsync(
        ActivationLookupRequest request,
        CancellationToken cancellationToken)
    {
        var application = await FindActivatableAsync(request.Token, cancellationToken);
        if (application is null)
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        // The application is approved in one step, so "reviewed" and "approved" share a time.
        var reviewedAt = application.ReviewedAt!.Value;
        return new AccountApprovalResponse(
            application.FirstName,
            application.Role,
            StaffId: null,
            Depot: null,
            application.Email,
            application.ReviewedByName ?? "Fleet Administrator",
            application.SubmittedAt,
            reviewedAt,
            reviewedAt);
    }

    public async Task<Result> ActivateAsync(ActivateAccountRequest request, CancellationToken cancellationToken)
    {
        var application = await FindActivatableAsync(request.Token, cancellationToken);
        if (application is null)
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        if (await userManager.FindByEmailAsync(application.Email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        var now = clock.GetUtcNow();
        var user = new ApplicationUser
        {
            UserName = application.Email,
            Email = application.Email,
            // Opening the emailed link proves the applicant owns the address.
            EmailConfirmed = true,
            FullName = application.FullName,
            PhoneNumber = application.Mobile,
            CreatedAt = now,
        };

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var created = await userManager.CreateAsync(user, request.Password);
        if (!created.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(created);
        }

        await userManager.AddToRoleAsync(user, application.Role.ToAuthRole());
        application.MarkActivated(user.Id, now);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // The same link was used twice at the same moment; the other request won.
            return AuthErrors.InvalidOrExpiredLink;
        }

        await transaction.CommitAsync(cancellationToken);
        return Result.Success();
    }

    private async Task<StaffApplication?> FindActivatableAsync(string rawToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return null;
        }

        var hash = SecureToken.Hash(rawToken);
        var application = await db.StaffApplications
            .SingleOrDefaultAsync(a => a.ActivationTokenHash == hash, cancellationToken);

        return application is not null && application.CanActivate(clock.GetUtcNow()) ? application : null;
    }
}
