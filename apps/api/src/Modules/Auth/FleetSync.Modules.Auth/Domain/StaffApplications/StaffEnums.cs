namespace FleetSync.Modules.Auth.Domain.StaffApplications;

/// <summary>
/// Roles a person can apply for. Customers register separately and
/// owner/fleet-administrator are assigned, never applied for.
/// Serialized in JSON as "driver", "mechanic", "coordinator".
/// </summary>
internal enum StaffRole
{
    Driver = 1,
    Mechanic = 2,
    Coordinator = 3,
}

/// <summary>
/// Sri Lankan driving licence groups (driver applications only).
/// Serialized as "light", "light-lorry", "heavy", "heavy-trailer" to match the mobile app.
/// </summary>
internal enum LicenceClass
{
    Light = 1,
    LightLorry = 2,
    Heavy = 3,
    HeavyTrailer = 4,
}

/// <summary>Where a staff application is in its review lifecycle.</summary>
internal enum StaffApplicationStatus
{
    /// <summary>Submitted, waiting for a Fleet Administrator.</summary>
    Pending = 1,

    /// <summary>Approved; an activation link was emailed but no password is set yet.</summary>
    Approved = 2,

    /// <summary>Declined by a Fleet Administrator.</summary>
    Rejected = 3,

    /// <summary>The applicant set a password and the staff account now exists.</summary>
    Activated = 4,
}

internal static class StaffRoleExtensions
{
    /// <summary>The Identity role an approved applicant receives.</summary>
    public static string ToAuthRole(this StaffRole role) => role switch
    {
        StaffRole.Driver => AuthRoles.Driver,
        StaffRole.Mechanic => AuthRoles.Mechanic,
        StaffRole.Coordinator => AuthRoles.Coordinator,
        _ => throw new ArgumentOutOfRangeException(nameof(role), role, "Unknown staff role."),
    };
}
