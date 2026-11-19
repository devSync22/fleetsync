namespace FleetSync.Application.Security;

/// <summary>
/// Authorization policies shared by every module (apps/api/CLAUDE.md, API rules). The host registers them with
/// their role lists; modules only refer to the names. Add a policy here when the team agrees its role list.
/// </summary>
public static class FleetSyncPolicies
{
    /// <summary>
    /// Day-to-day operations: orders, quotations, trips, availability. Operational Coordinators only
    /// (Orders module plan §5, agreed 2026-11-17).
    /// </summary>
    public const string RequireOperations = "RequireOperations";
}
