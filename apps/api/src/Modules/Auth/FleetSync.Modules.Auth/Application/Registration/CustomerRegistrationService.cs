using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Registration;

/// <summary>
/// Self-service registration for customer companies, and the email
/// verification that must happen before a customer can sign in.
/// </summary>
internal sealed class CustomerRegistrationService(
    UserManager<ApplicationUser> userManager,
    AuthDbContext db,
    OneTimeTokenService oneTimeTokens,
    IReferenceNumberGenerator references,
    IEmailSender emailSender,
    AuthEmails emails,
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

        var now = clock.GetUtcNow();
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = request.FullName.Trim(),
            PhoneNumber = FieldRules.NormalizeMobile(request.Mobile),
            CreatedAt = now,
        };

        // Account, role, profile and token are saved together or not at all.
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var created = await userManager.CreateAsync(user, request.Password);
        if (!created.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(created);
        }

        await userManager.AddToRoleAsync(user, AuthRoles.Customer);

        var reference = await references.NextRegistrationReferenceAsync(cancellationToken);
        db.CustomerProfiles.Add(new CustomerProfile(
            user.Id,
            reference,
            request.CompanyName.Trim(),
            request.BusinessRegistrationNo.Trim(),
            request.BillingAddress.Trim(),
            now));

        var token = await oneTimeTokens.IssueAsync(
            user.Id, OneTimeTokenPurpose.EmailVerification, VerificationLifetime, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        // Sent after commit so nobody receives a link for an account that was rolled back.
        await emailSender.SendAsync(emails.VerifyEmail(email, FirstName(user), reference, token), cancellationToken);

        return new RegistrationSubmittedResponse(reference, email, now);
    }

    public async Task<Result> VerifyEmailAsync(VerifyEmailRequest request, CancellationToken cancellationToken)
    {
        var token = await oneTimeTokens.FindUsableAsync(
            request.Token, OneTimeTokenPurpose.EmailVerification, cancellationToken);
        if (token is null)
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        var user = await userManager.FindByIdAsync(token.UserId.ToString());
        if (user is null)
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        token.Consume(clock.GetUtcNow());
        user.EmailConfirmed = true;

        // One SaveChanges for both the user and the token (same DbContext).
        await db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    /// <summary>
    /// Sends a fresh verification link if the account exists and is unverified.
    /// Always "succeeds" so the endpoint can't be used to probe which emails are registered.
    /// </summary>
    public async Task ResendVerificationAsync(ResendVerificationRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(FieldRules.NormalizeEmail(request.Email));
        if (user is null || user.EmailConfirmed || !await userManager.IsInRoleAsync(user, AuthRoles.Customer))
        {
            return;
        }

        var profile = await db.CustomerProfiles.SingleAsync(p => p.UserId == user.Id, cancellationToken);
        var token = await oneTimeTokens.IssueAsync(
            user.Id, OneTimeTokenPurpose.EmailVerification, VerificationLifetime, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(
            emails.VerifyEmail(user.Email!, FirstName(user), profile.Reference, token), cancellationToken);
    }

    private static string FirstName(ApplicationUser user) =>
        user.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? user.FullName;
}
