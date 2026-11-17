using FleetSync.Modules.Auth.Application.Applications;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Sessions;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Application.Users;

/// <summary>Body of PUT /api/auth/users/{id}/status.</summary>
internal sealed record SetUserStatusRequest(bool IsActive);

/// <summary>An account's state after an administrator changed it.</summary>
internal sealed record UserStatusResponse(Guid Id, string Email, string FullName, bool IsActive, DateTimeOffset? UpdatedAt);

/// <summary>One AUDIT_LOG row.</summary>
internal sealed record AuditLogEntryResponse(
    Guid Id,
    DateTimeOffset OccurredAt,
    string Action,
    string EntityType,
    string? EntityId,
    Guid? UserId,
    string? Details,
    string? IpAddress);

/// <summary>Fleet Administrator tools: deactivate / reactivate accounts (is_active) and read the audit log.</summary>
internal sealed class UserAdministrationService(
    AuthDbContext db,
    UserManager<ApplicationUser> userManager,
    SessionService sessions,
    AuditTrail audit)
{
    // API rule: lists default to 20 items, at most 100.
    private const int MaxPageSize = 100;

    /// <summary>
    /// Deactivating also ends every session, so the person is signed out
    /// within one access-token lifetime (15 minutes) at most.
    /// </summary>
    public async Task<Result<UserStatusResponse>> SetActiveAsync(
        Guid userId,
        bool isActive,
        Guid adminId,
        CancellationToken cancellationToken)
    {
        if (!isActive && userId == adminId)
        {
            return AuthErrors.CannotDeactivateSelf;
        }

        var user = await userManager.FindByIdAsync(userId.ToString());
        if (user is null)
        {
            return AuthErrors.UserNotFound;
        }

        if (user.IsActive != isActive)
        {
            user.IsActive = isActive;
            if (!isActive)
            {
                await sessions.RevokeAllForUserAsync(user.Id, cancellationToken);
            }

            audit.RecordForUser(
                isActive ? AuditActions.AccountReactivated : AuditActions.AccountDeactivated, user.Id, actorId: adminId);

            // UpdatedAt is stamped by AuthDbContext because IsActive changed.
            await db.SaveChangesAsync(cancellationToken);
        }

        return new UserStatusResponse(user.Id, user.Email ?? string.Empty, user.FullName, user.IsActive, user.UpdatedAt);
    }

    /// <summary>Newest first; filter by the user involved and/or the action (e.g. "LOGIN_FAILED").</summary>
    public async Task<PagedResponse<AuditLogEntryResponse>> ListAuditLogAsync(
        Guid? userId,
        string? action,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var query = db.AuditLog.AsNoTracking();
        if (userId is not null)
        {
            // Events done by the user, and events about their account (e.g. deactivated by an admin).
            var id = userId.Value.ToString();
            query = query.Where(a => a.UserId == userId || (a.EntityType == AuditEntityTypes.User && a.EntityId == id));
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            var normalized = action.Trim().ToUpperInvariant();
            query = query.Where(a => a.Action == normalized);
        }

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogEntryResponse(
                a.Id, a.OccurredAt, a.Action, a.EntityType, a.EntityId, a.UserId, a.Details, a.IpAddress))
            .ToListAsync(cancellationToken);

        return new PagedResponse<AuditLogEntryResponse>(items, page, pageSize, total);
    }
}
