namespace FleetSync.Modules.Auth.Domain;

/// <summary>
/// The FleetSync role names stored in ASP.NET Core Identity and placed in the
/// JWT "role" claim. They are kebab-case so they read the same in the API,
/// the web app and the mobile app.
/// </summary>
internal static class AuthRoles
{
    /// <summary>Business owner; full access. Assigned manually, never self-registered.</summary>
    public const string Owner = "owner";

    /// <summary>Reviews staff applications and manages the fleet. Assigned manually.</summary>
    public const string FleetAdministrator = "fleet-administrator";

    /// <summary>Office staff who plan and coordinate trips (web app).</summary>
    public const string Coordinator = "coordinator";

    /// <summary>Drives vehicles (mobile app).</summary>
    public const string Driver = "driver";

    /// <summary>Maintains vehicles (mobile app).</summary>
    public const string Mechanic = "mechanic";

    /// <summary>A customer company's contact person; self-registers on the website.</summary>
    public const string Customer = "customer";

    /// <summary>Every role, used when seeding the roles table.</summary>
    public static readonly IReadOnlyList<string> All =
        [Owner, FleetAdministrator, Coordinator, Driver, Mechanic, Customer];
}
