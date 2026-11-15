using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Sessions;

/// <summary>A freshly issued session, before the endpoint decides cookie vs body for the refresh token.</summary>
internal sealed record IssuedSession(
    AccessToken AccessToken,
    string RefreshToken,
    DateTimeOffset RefreshTokenExpiresAt,
    bool IsPersistent,
    AuthUserResponse User);

/// <summary>
/// Sign-in, token refresh and sign-out.
///
/// Access tokens are short-lived JWTs. Refresh tokens are random values stored
/// as hashes and rotated on every use, with reuse detection (see <see cref="RefreshToken"/>).
/// </summary>
internal sealed class SessionService(
    UserManager<ApplicationUser> userManager,
    IPasswordHasher<ApplicationUser> passwordHasher,
    AuthDbContext db,
    AccessTokenIssuer accessTokens,
    AuditTrail audit,
    IOptions<AuthOptions> options,
    TimeProvider clock)
{
    private JwtOptions Jwt => options.Value.Jwt;

    public async Task<Result<IssuedSession>> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = FieldRules.NormalizeEmail(request.Email);
        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            return await LoginWithoutAccountAsync(email, request.Password, cancellationToken);
        }

        if (await userManager.IsLockedOutAsync(user))
        {
            return AuthErrors.LockedOut(user.LockoutEnd!.Value);
        }

        if (!await userManager.CheckPasswordAsync(user, request.Password))
        {
            // Recorded first: AccessFailedAsync saves the context, audit row included.
            audit.RecordForUser(AuditActions.LoginFailed, user.Id, details: "Wrong password");

            // Counts the failure; Identity locks the account when the limit is reached.
            await userManager.AccessFailedAsync(user);

            if (await userManager.IsLockedOutAsync(user))
            {
                audit.RecordForUser(AuditActions.LockedOut, user.Id);
                await db.SaveChangesAsync(cancellationToken);
                return AuthErrors.LockedOut(user.LockoutEnd!.Value);
            }

            var failed = await userManager.GetAccessFailedCountAsync(user);
            return AuthErrors.InvalidCredentials(options.Value.Lockout.MaxFailedAttempts - failed);
        }

        // Checked after the password so these states don't reveal themselves to guessers.
        if (!user.IsActive)
        {
            audit.RecordForUser(AuditActions.LoginFailed, user.Id, details: "Account deactivated");
            await db.SaveChangesAsync(cancellationToken);
            return AuthErrors.AccountDisabled;
        }

        if (!user.EmailConfirmed)
        {
            return AuthErrors.EmailNotVerified;
        }

        await userManager.ResetAccessFailedCountAsync(user);
        user.LastSignInAt = clock.GetUtcNow();
        audit.RecordForUser(AuditActions.Login, user.Id, details: request.RememberMe ? "Remember me" : null);

        return await IssueSessionAsync(user, request.RememberMe, cancellationToken);
    }

    /// <summary>
    /// No account with this email. A customer whose application is still pending
    /// is told so, but only when the password matches the one they registered
    /// with, so this can't be used to discover who has applied.
    /// </summary>
    private async Task<Result<IssuedSession>> LoginWithoutAccountAsync(
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var normalized = UserApplication.NormalizeEmail(email);
        var pending = await db.UserApplications.AsNoTracking().SingleOrDefaultAsync(
            a => a.NormalizedEmail == normalized
                 && a.RequestedRole == ApplicantRole.Customer
                 && a.Status == ApplicationStatus.Pending
                 && a.PasswordHash != null,
            cancellationToken);

        if (pending is not null
            && passwordHasher.VerifyHashedPassword(new ApplicationUser(), pending.PasswordHash!, password)
                != PasswordVerificationResult.Failed)
        {
            return pending.IsEmailVerified ? AuthErrors.PendingApproval : AuthErrors.EmailNotVerified;
        }

        // The email isn't stored: anyone can type anything here, and the IP is enough to spot guessing.
        audit.Record(AuditActions.LoginFailed, AuditEntityTypes.User, entityId: null, userId: null, "Unknown email");
        await db.SaveChangesAsync(cancellationToken);

        // Same response as a wrong password, so the form can't reveal which emails exist.
        return AuthErrors.InvalidCredentials(attemptsLeft: null);
    }

    public async Task<Result<IssuedSession>> RefreshAsync(string? rawToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return AuthErrors.InvalidRefreshToken;
        }

        var now = clock.GetUtcNow();
        var hash = SecureToken.Hash(rawToken);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

        if (stored is null)
        {
            return AuthErrors.InvalidRefreshToken;
        }

        if (stored.RevokedAt is not null)
        {
            // A rotated-out token came back: assume it leaked and end the whole session family.
            await RevokeFamilyAsync(stored.FamilyId, now, cancellationToken);
            audit.RecordForUser(AuditActions.RefreshTokenReuse, stored.UserId, details: "All sessions from this sign-in ended");
            await db.SaveChangesAsync(cancellationToken);
            return AuthErrors.InvalidRefreshToken;
        }

        if (!stored.IsActive(now))
        {
            return AuthErrors.InvalidRefreshToken;
        }

        var user = await userManager.FindByIdAsync(stored.UserId.ToString());
        // Deactivated or locked accounts lose their sessions at the next refresh.
        if (user is null || !user.IsActive || await userManager.IsLockedOutAsync(user))
        {
            await RevokeFamilyAsync(stored.FamilyId, now, cancellationToken);
            return AuthErrors.InvalidRefreshToken;
        }

        var raw = SecureToken.Generate();
        var successor = stored.Rotate(SecureToken.Hash(raw), now, RefreshLifetime(stored.IsPersistent), audit.CurrentClient());
        db.RefreshTokens.Add(successor);

        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Another request rotated this token at the same moment; let that one win.
            return AuthErrors.InvalidRefreshToken;
        }

        return await BuildSessionAsync(user, raw, successor);
    }

    /// <summary>Ends the session the refresh token belongs to. Unknown tokens are ignored.</summary>
    public async Task LogoutAsync(string? rawToken, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return;
        }

        var hash = SecureToken.Hash(rawToken);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash, cancellationToken);

        if (stored is not null)
        {
            await RevokeFamilyAsync(stored.FamilyId, clock.GetUtcNow(), cancellationToken);
            audit.RecordForUser(AuditActions.Logout, stored.UserId);
            await db.SaveChangesAsync(cancellationToken);
        }
    }

    /// <summary>Signs the user out everywhere (e.g. after a password reset). Saved by the caller.</summary>
    public async Task RevokeAllForUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var active = await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync(cancellationToken);

        active.ForEach(t => t.Revoke(now));
    }

    public async Task<AuthUserResponse?> GetUserAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString());
        return user is null ? null : await ToResponseAsync(user);
    }

    private async Task<IssuedSession> IssueSessionAsync(
        ApplicationUser user,
        bool rememberMe,
        CancellationToken cancellationToken)
    {
        var raw = SecureToken.Generate();
        var refreshToken = RefreshToken.IssueNew(
            user.Id, SecureToken.Hash(raw), rememberMe, clock.GetUtcNow(), RefreshLifetime(rememberMe), audit.CurrentClient());

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        return await BuildSessionAsync(user, raw, refreshToken);
    }

    private async Task<IssuedSession> BuildSessionAsync(ApplicationUser user, string rawRefreshToken, RefreshToken refreshToken)
    {
        var profile = await ToResponseAsync(user);
        var accessToken = accessTokens.Issue(user, profile.Roles);

        return new IssuedSession(accessToken, rawRefreshToken, refreshToken.ExpiresAt, refreshToken.IsPersistent, profile);
    }

    private async Task<AuthUserResponse> ToResponseAsync(ApplicationUser user)
    {
        var roles = await userManager.GetRolesAsync(user);
        return new AuthUserResponse(user.Id, user.Email ?? string.Empty, user.FullName, roles.Order().ToList());
    }

    private async Task RevokeFamilyAsync(Guid familyId, DateTimeOffset now, CancellationToken cancellationToken)
    {
        // Bulk update: no need to load every token in the chain.
        await db.RefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(t => t.RevokedAt, now), cancellationToken);
    }

    private TimeSpan RefreshLifetime(bool persistent) =>
        TimeSpan.FromDays(persistent ? Jwt.RememberMeRefreshTokenDays : Jwt.RefreshTokenDays);
}
