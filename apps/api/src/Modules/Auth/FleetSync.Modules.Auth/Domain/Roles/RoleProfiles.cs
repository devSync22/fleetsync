using FleetSync.Modules.Auth.Domain.Applications;

namespace FleetSync.Modules.Auth.Domain.Roles;

// EER role subtypes of USER: total and disjoint, so every account has exactly
// one row in exactly one of these tables, keyed by the user's id.
//
// The Identity role (UserRoles) is written alongside the subtype row by
// RoleAssignment; Identity's role is what [Authorize] and the JWT use, the
// subtype row holds the role's own data and is what other tables reference
// (e.g. reviewed_by → FLEET_ADMINISTRATOR).

/// <summary>FLEET_ADMINISTRATOR: reviews applications and profile changes. Assigned manually.</summary>
internal sealed class FleetAdministrator
{
    private FleetAdministrator()
    {
    }

    public FleetAdministrator(Guid userId) => UserId = userId;

    public Guid UserId { get; private set; }
}

/// <summary>FLEET_OWNER.</summary>
internal sealed class FleetOwner
{
    private FleetOwner()
    {
    }

    public FleetOwner(Guid userId) => UserId = userId;

    public Guid UserId { get; private set; }
}

/// <summary>OPERATIONAL_COORDINATOR: office staff who plan and coordinate trips.</summary>
internal sealed class OperationalCoordinator
{
    private OperationalCoordinator()
    {
    }

    public OperationalCoordinator(Guid userId) => UserId = userId;

    public Guid UserId { get; private set; }
}

/// <summary>MECHANIC.</summary>
internal sealed class Mechanic
{
    private Mechanic()
    {
    }

    public Mechanic(Guid userId) => UserId = userId;

    public Guid UserId { get; private set; }
}

/// <summary>DRIVER: holds the driving licence (licence_number is unique across drivers).</summary>
internal sealed class Driver
{
    private Driver()
    {
    }

    public Driver(Guid userId, string licenceNumber, LicenceClass licenceClass, DateOnly? licenceExpiry)
    {
        UserId = userId;
        LicenceNumber = licenceNumber;
        LicenceClass = licenceClass;
        LicenceExpiry = licenceExpiry;
    }

    public Guid UserId { get; private set; }

    public string LicenceNumber { get; private set; } = string.Empty;

    /// <summary>Not in the EER; kept because the apps already collect it.</summary>
    public LicenceClass LicenceClass { get; private set; }

    /// <summary>Optional until the web and mobile forms collect it.</summary>
    public DateOnly? LicenceExpiry { get; private set; }

    /// <summary>Applied from an approved profile change request.</summary>
    public void ChangeLicence(string? number = null, LicenceClass? licenceClass = null, DateOnly? expiry = null)
    {
        LicenceNumber = number ?? LicenceNumber;
        LicenceClass = licenceClass ?? LicenceClass;
        LicenceExpiry = expiry ?? LicenceExpiry;
    }
}

/// <summary>CUSTOMER: a customer company's contact person.</summary>
internal sealed class Customer
{
    private Customer()
    {
    }

    public Customer(Guid userId, Guid? companyId)
    {
        UserId = userId;
        CompanyId = companyId;
    }

    public Guid UserId { get; private set; }

    /// <summary>company_id → CUSTOMER_COMPANY (nullable in the EER).</summary>
    public Guid? CompanyId { get; private set; }
}

/// <summary>
/// CUSTOMER_COMPANY: the customer business. Several contact persons (CUSTOMER)
/// can belong to one company; the business registration number identifies it.
/// </summary>
internal sealed class CustomerCompany
{
    private CustomerCompany()
    {
    }

    public CustomerCompany(string companyName, string businessRegistrationNo, string billingAddress, DateTimeOffset createdAt)
    {
        Id = Guid.CreateVersion7();
        CompanyName = companyName;
        BusinessRegistrationNo = businessRegistrationNo;
        NormalizedBusinessRegistrationNo = NormalizeRegistrationNo(businessRegistrationNo);
        BillingAddress = billingAddress;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public string CompanyName { get; private set; } = string.Empty;

    /// <summary>As entered, e.g. "PV 12345".</summary>
    public string BusinessRegistrationNo { get; private set; } = string.Empty;

    /// <summary>Upper-case without spaces ("PV12345"), so "pv 12345" finds the same company.</summary>
    public string NormalizedBusinessRegistrationNo { get; private set; } = string.Empty;

    public string BillingAddress { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }

    public static string NormalizeRegistrationNo(string value) =>
        new string(value.Where(c => !char.IsWhiteSpace(c)).ToArray()).ToUpperInvariant();
}
