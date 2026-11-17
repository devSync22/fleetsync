namespace FleetSync.Modules.Orders.Domain;

/// <summary>
/// The customer's company and contact <b>as at placement</b> (plan §6): an order keeps showing the details it was
/// placed with, even if the company later changes them in the Auth module.
/// </summary>
internal sealed record CustomerSnapshot(string CompanyName, string ContactName, string? ContactPhone, string ContactEmail);

/// <summary>A pickup or destination (EER composite location). No coordinates: FleetSync has no GPS or maps.</summary>
internal sealed record Location(string Address, string City, string? ContactName = null, string? ContactPhone = null);

/// <summary>What is carried (DI-12). <see cref="UnitsDetail"/> describes the units, e.g. "50 kg each".</summary>
internal sealed record CargoDetails(
    CargoType Type,
    string Description,
    decimal WeightKg,
    int UnitsCount,
    string? UnitsDetail = null,
    string? Handling = null,
    string? Note = null);
