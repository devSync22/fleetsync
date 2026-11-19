namespace FleetSync.Application.Security;

/// <summary>
/// Role names as they appear in the access token's <c>role</c> claim. Same values as the Auth module's
/// <c>AuthRoles</c>; modules use these so they don't depend on the Auth module's internals.
/// </summary>
public static class FleetSyncRoles
{
    public const string Owner = "owner";
    public const string FleetAdministrator = "fleet-administrator";
    public const string Coordinator = "coordinator";
    public const string Driver = "driver";
    public const string Mechanic = "mechanic";
    public const string Customer = "customer";
}
