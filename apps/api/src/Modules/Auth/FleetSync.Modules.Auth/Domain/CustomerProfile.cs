namespace FleetSync.Modules.Auth.Domain;

/// <summary>
/// Company details captured by the "Customer registration" form.
/// Kept in the Auth module for now because registration is the only feature
/// that uses it; it can move to a dedicated Customers module later.
/// </summary>
internal sealed class CustomerProfile
{
    // Required by EF Core.
    private CustomerProfile()
    {
    }

    public CustomerProfile(
        Guid userId,
        string reference,
        string companyName,
        string businessRegistrationNo,
        string billingAddress,
        DateTimeOffset createdAt)
    {
        Id = Guid.CreateVersion7();
        UserId = userId;
        Reference = reference;
        CompanyName = companyName;
        BusinessRegistrationNo = businessRegistrationNo;
        BillingAddress = billingAddress;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    /// <summary>The contact person's account (one profile per account).</summary>
    public Guid UserId { get; private set; }

    /// <summary>Registration reference shown to the customer, e.g. "REG-2026-0142".</summary>
    public string Reference { get; private set; } = string.Empty;

    public string CompanyName { get; private set; } = string.Empty;

    public string BusinessRegistrationNo { get; private set; } = string.Empty;

    public string BillingAddress { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }
}
