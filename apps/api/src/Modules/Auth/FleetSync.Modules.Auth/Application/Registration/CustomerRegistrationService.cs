using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Registration;

/// <summary>
/// Customer registration. It creates a USER_APPLICATION, not an account:
/// the customer verifies their email, a Fleet Administrator approves the
/// application, and only then is the account created (see UserApplicationService).
/// </summary>
internal sealed class CustomerRegistrationService(
    UserManager<ApplicationUser> userManager,
    IPasswordHasher<ApplicationUser> passwordHasher,
    AuthDbContext db,
    IReferenceNumberGenerator references,
    IEmailSender emailSender,
    AuthEmails emails,
    AuditTrail audit,
    IOptions<AuthOptions> options,
    TimeProvider clock)
{
    private TimeSpan VerificationLifetime => TimeSpan.FromHours(options.Value.Tokens.EmailVerificationHours);

    public async Task<Result<RegistrationSubmittedResponse>> RegisterAsync(
        RegisterCustomerRequest request,
        CancellationToken cancellationToken)
    {
        var email = FieldRules.NormalizeEmail(request.Email);
        if (await userManager.FindByEmailAsync(email) is not null)
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        if (await HasOpenApplicationAsync(email, cancellationToken))
        {
            return AuthErrors.ApplicationDuplicate;
        }

        // Run Identity's password policy now: there is no account yet to reject it later.
        var policy = await CheckPasswordPolicyAsync(email, request.Password);
        if (!policy.IsSuccess)
        {
            return policy.Error;
        }

        var now = clock.GetUtcNow();
        var token = SecureToken.Generate();

        // Only the hash is stored; it becomes the account's password on approval.
        var passwordHash = passwordHasher.HashPassword(new ApplicationUser { Email = email }, request.Password);

        var application = UserApplication.ForCustomer(
            await references.NextRegistrationReferenceAsync(cancellationToken),
            request.FullName.Trim(),
            email,
            FieldRules.NormalizeMobile(request.Mobile),
            request.CompanyName.Trim(),
            request.BusinessRegistrationNo.Trim(),
            request.BillingAddress.Trim(),
            passwordHash,
            SecureToken.Hash(token),
            now,
            VerificationLifetime);

        db.UserApplications.Add(application);
        audit.Record(AuditActions.ApplicationSubmitted, AuditEntityTypes.UserApplication, application.Id.ToString(),
            userId: null, $"{application.Reference}, role customer");
        await db.SaveChangesAsync(cancellationToken);

        // Sent after the save so nobody receives a link for an application that wasn't stored.
        await emailSender.SendAsync(
            emails.VerifyEmail(email, application.FirstName, application.Reference, token), cancellationToken);

        return new RegistrationSubmittedResponse(application.Reference, email, now);
    }

    /// <summary>The emailed link was opened: the application is ready for review.</summary>
    public async Task<Result> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var hash = SecureToken.Hash(request.Token);
        var application = await db.UserApplications
            .SingleOrDefaultAsync(a => a.EmailVerificationTokenHash == hash, cancellationToken);

        if (application is null || !application.CanVerifyEmail(now))
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        application.MarkEmailVerified(now);
        audit.Record(AuditActions.EmailVerified, AuditEntityTypes.UserApplication, application.Id.ToString(), userId: null);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // The same link was opened twice at the same moment; the other request won.
            return AuthErrors.InvalidOrExpiredLink;
        }

        return Result.Success();
    }

    /// <summary>
    /// Sends a fresh verification link for a pending, unverified customer application.
    /// Always "succeeds" so the endpoint can't be used to probe which emails are registered.
    /// </summary>
    public async Task ResendVerificationAsync(ResendVerificationRequest request, CancellationToken cancellationToken)
    {
        var normalized = UserApplication.NormalizeEmail(FieldRules.NormalizeEmail(request.Email));
        var application = await db.UserApplications.SingleOrDefaultAsync(
            a => a.NormalizedEmail == normalized
                 && a.RequestedRole == ApplicantRole.Customer
                 && a.Status == ApplicationStatus.Pending
                 && a.EmailVerifiedAt == null,
            cancellationToken);
        if (application is null)
        {
            return;
        }

        var token = SecureToken.Generate();
        application.ReissueEmailVerification(SecureToken.Hash(token), clock.GetUtcNow(), VerificationLifetime);
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(
            emails.VerifyEmail(application.Email, application.FirstName, application.Reference, token), cancellationToken);
    }

    private Task<bool> HasOpenApplicationAsync(string email, CancellationToken cancellationToken)
    {
        var normalized = UserApplication.NormalizeEmail(email);
        return db.UserApplications.AnyAsync(
            a => a.NormalizedEmail == normalized
                 && (a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved),
            cancellationToken);
    }

    private async Task<Result> CheckPasswordPolicyAsync(string email, string password)
    {
        var candidate = new ApplicationUser { UserName = email, Email = email };
        foreach (var validator in userManager.PasswordValidators)
        {
            var check = await validator.ValidateAsync(userManager, candidate, password);
            if (!check.Succeeded)
            {
                return IdentityErrorMapper.ToAuthError(check);
            }
        }

        return Result.Success();
    }
}
