using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Writes AUDIT_LOG rows and tells services where the current request came from.
///
/// <see cref="Record"/> only adds the row to the DbContext: it is saved by the
/// caller's next SaveChanges, so the audit entry commits (or rolls back)
/// together with the change it describes.
/// </summary>
internal sealed class AuditTrail(AuthDbContext db, IHttpContextAccessor http, TimeProvider clock)
{
    public void Record(string action, string entityType, string? entityId, Guid? userId, string? details = null) =>
        db.AuditLog.Add(new AuditLogEntry(
            entityType,
            entityId,
            action,
            clock.GetUtcNow(),
            details,
            userId,
            CurrentClient().IpAddress));

    /// <summary>Records an event about a user account (entity_type "User").</summary>
    public void RecordForUser(string action, Guid userId, Guid? actorId = null, string? details = null) =>
        Record(action, AuditEntityTypes.User, userId.ToString(), actorId ?? userId, details);

    /// <summary>IP address and User-Agent of the current request; unknown outside a request.</summary>
    public ClientInfo CurrentClient()
    {
        var context = http.HttpContext;
        if (context is null)
        {
            return ClientInfo.Unknown;
        }

        var userAgent = context.Request.Headers.UserAgent.ToString();
        if (userAgent.Length > ClientInfo.MaxUserAgentLength)
        {
            userAgent = userAgent[..ClientInfo.MaxUserAgentLength];
        }

        return new ClientInfo(
            context.Connection.RemoteIpAddress?.ToString(),
            string.IsNullOrEmpty(userAgent) ? null : userAgent);
    }
}
