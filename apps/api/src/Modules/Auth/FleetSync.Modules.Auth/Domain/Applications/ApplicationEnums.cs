namespace FleetSync.Modules.Auth.Domain.Applications;

/// <summary>
/// USER_APPLICATION.requested_role: the roles a person can apply for.
/// Fleet Administrators are never applied for; they are assigned manually.
/// Serialized in JSON as "customer", "driver", "mechanic", "coordinator", "owner".
/// </summary>
internal enum ApplicantRole
{
    /// <summary>A customer company's contact person (applies via /register/customer).</summary>
    Customer = 1,

    Driver = 2,

    Mechanic = 3,

    /// <summary>Operational coordinator (office staff who plan trips).</summary>
    Coordinator = 4,

    /// <summary>Fleet owner.</summary>
    Owner = 5,
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

/// <summary>USER_APPLICATION.application_status: where an application is in its review lifecycle.</summary>
internal enum ApplicationStatus
{
    /// <summary>Submitted, waiting for a Fleet Administrator.</summary>
    Pending = 1,

    /// <summary>
    /// Approved. Customers can sign in straight away; staff get an activation
    /// link and the account exists only once they set a password.
    /// </summary>
    Approved = 2,

    /// <summary>Declined by a Fleet Administrator.</summary>
    Rejected = 3,

    /// <summary>Staff only: the applicant set a password and the account now exists.</summary>
    Activated = 4,
}

internal static class ApplicantRoleExtensions
{
    /// <summary>The Identity role (JWT "role" claim) an approved applicant receives.</summary>
    public static string ToAuthRole(this ApplicantRole role) => role switch
    {
        ApplicantRole.Customer => AuthRoles.Customer,
        ApplicantRole.Driver => AuthRoles.Driver,
        ApplicantRole.Mechanic => AuthRoles.Mechanic,
        ApplicantRole.Coordinator => AuthRoles.Coordinator,
        ApplicantRole.Owner => AuthRoles.Owner,
        _ => throw new ArgumentOutOfRangeException(nameof(role), role, "Unknown applicant role."),
    };

    /// <summary>
    /// Staff roles apply with the multipart staff form (NIC + documents) and
    /// activate their account from an emailed link; customers use the
    /// registration form and choose their password up front.
    /// </summary>
    public static bool IsStaff(this ApplicantRole role) => role != ApplicantRole.Customer;
}
