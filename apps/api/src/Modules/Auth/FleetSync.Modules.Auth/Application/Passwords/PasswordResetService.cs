using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Sessions;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Passwords;

/// <summary>
/// "Forgot password" emails and the reset itself. A reset also unlocks the
/// account and signs the user out on every device.
/// </summary>
internal sealed class PasswordResetService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    IPasswordHasher<ApplicationUser> passwordHasher,
    OneTimeTokenService oneTimeTokens,
    SessionService sessions,
    IEmailSender emailSender,
    AuthEmails emails,
    AuditTrail audit,
    IOptions<AuthOptions> options,
    TimeProvider clock)
{
    /// <summary>How many earlier passwords may not be reused.</summary>
    private const int PasswordHistoryDepth = 5;

    /// <summary>
    /// Emails a reset link when the account exists and its email is confirmed.
    /// Always "succeeds" so the form can't be used to discover registered emails.
    /// </summary>
    public async Task RequestResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(FieldRules.NormalizeEmail(request.Email));
        // Deactivated accounts get no link: a new password wouldn't let them in anyway.
        if (user is null || !user.EmailConfirmed || !user.IsActive)
        {
            return;
        }

        var token = await oneTimeTokens.IssueAsync(
            user.Id,
            OneTimeTokenPurpose.PasswordReset,
            TimeSpan.FromMinutes(options.Value.Tokens.PasswordResetMinutes),
            cancellationToken);
        audit.RecordForUser(AuditActions.PasswordResetRequested, user.Id);
        await db.SaveChangesAsync(cancellationToken);

        var firstName = user.FullName.Split(' ', StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? user.FullName;
        await emailSender.SendAsync(emails.ResetPassword(user.Email!, firstName, token), cancellationToken);
    }

    public async Task<Result<ResetPasswordLookupResponse>> LookupAsync(
        ResetPasswordLookupRequest request,
        CancellationToken cancellationToken)
    {
        var (_, user) = await FindTargetAsync(request.Token, cancellationToken);
        return user is null ? AuthErrors.InvalidOrExpiredLink : new ResetPasswordLookupResponse(user.Email!);
    }

    public async Task<Result> ResetAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        // The token is checked first, so the "password reused" answer is only
        // ever given to someone holding a valid link (no password oracle).
        var (token, user) = await FindTargetAsync(request.Token, cancellationToken);
        if (token is null || user is null)
        {
            return AuthErrors.InvalidOrExpiredLink;
        }

        if (await IsReusedPasswordAsync(user, request.NewPassword, cancellationToken))
        {
            return AuthErrors.PasswordReused;
        }

        // Check the policy before changing anything (RemovePassword + AddPassword is not atomic).
        foreach (var validator in userManager.PasswordValidators)
        {
            var check = await validator.ValidateAsync(userManager, user, request.NewPassword);
            if (!check.Succeeded)
            {
                return IdentityErrorMapper.ToAuthError(check);
            }
        }

        var now = clock.GetUtcNow();
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        if (user.PasswordHash is not null)
        {
            db.PasswordHistory.Add(new PasswordHistoryEntry(user.Id, user.PasswordHash, now));
            await userManager.RemovePasswordAsync(user);
        }

        // Also rotates the security stamp.
        var changed = await userManager.AddPasswordAsync(user, request.NewPassword);
        if (!changed.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(changed);
        }

        token.Consume(now);

        // A completed reset clears any lockout and ends existing sessions.
        await userManager.SetLockoutEndDateAsync(user, null);
        await userManager.ResetAccessFailedCountAsync(user);
        await sessions.RevokeAllForUserAsync(user.Id, cancellationToken);
        audit.RecordForUser(AuditActions.PasswordReset, user.Id, details: "All sessions ended");

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Result.Success();
    }

    /// <summary>
    /// Signed-in password change: checks the current password, then applies the
    /// same reuse and policy rules as a reset. Every existing session is ended
    /// (other devices are signed out) and a new session is returned for the
    /// device that made the change, so it stays signed in.
    /// </summary>
    public async Task<Result<IssuedSession>> ChangeAsync(Guid userId, ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null || !user.IsActive)
        {
            return AuthErrors.UserNotFound;
        }

        if (!await userManager.CheckPasswordAsync(user, request.CurrentPassword))
        {
            return AuthErrors.WrongCurrentPassword;
        }

        if (await IsReusedPasswordAsync(user, request.NewPassword, cancellationToken))
        {
            return AuthErrors.PasswordReused;
        }

        var now = clock.GetUtcNow();
        var previousHash = user.PasswordHash;
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        // ChangePasswordAsync runs the password validators and rotates the security stamp.
        var changed = await userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!changed.Succeeded)
        {
            return IdentityErrorMapper.ToAuthError(changed);
        }

        if (previousHash is not null)
        {
            db.PasswordHistory.Add(new PasswordHistoryEntry(user.Id, previousHash, now));
        }

        // Sign out every device, then start a new session for this one (saved together).
        await sessions.RevokeAllForUserAsync(user.Id, cancellationToken);
        audit.RecordForUser(AuditActions.PasswordChanged, user.Id, details: "Other sessions ended");
        var session = await sessions.StartNewSessionAsync(user, request.RememberMe, cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return session;
    }

    private async Task<(OneTimeToken? Token, ApplicationUser? User)> FindTargetAsync(
        string rawToken,
        CancellationToken cancellationToken)
    {
        var token = await oneTimeTokens.FindUsableAsync(rawToken, OneTimeTokenPurpose.PasswordReset, cancellationToken);
        if (token is null)
        {
            return (null, null);
        }

        var user = await userManager.FindByIdAsync(token.UserId.ToString());
        return (token, user);
    }

    /// <summary>True when the password matches the current one or a recent previous one.</summary>
    private async Task<bool> IsReusedPasswordAsync(ApplicationUser user, string password, CancellationToken cancellationToken)
    {
        var previousHashes = await db.PasswordHistory
            .Where(p => p.UserId == user.Id)
            .OrderByDescending(p => p.CreatedAt)
            .Take(PasswordHistoryDepth - 1)
            .Select(p => p.PasswordHash)
            .ToListAsync(cancellationToken);

        if (user.PasswordHash is not null)
        {
            previousHashes.Insert(0, user.PasswordHash);
        }

        return previousHashes.Any(hash =>
            passwordHasher.VerifyHashedPassword(user, hash, password) != PasswordVerificationResult.Failed);
    }
}
