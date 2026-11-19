using FleetSync.Modules.Orders.Domain;

namespace FleetSync.Modules.Orders.Infrastructure.Seeding;

/// <summary>A Sri Lankan date-time relative to the day the data is seeded: <c>Day</c> 0 is today, -1 yesterday.</summary>
internal readonly record struct SeedTime(int Day, int Hour, int Minute);

internal sealed record SeedQuote(
    SeedTime SentAt,
    SeedTime ValidUntil,
    (QuotationLineKind Kind, string Label, string? Detail, decimal Amount)[] Extras,
    string? Message);

/// <summary>What happened after the quotation (none = still waiting for the customer).</summary>
internal sealed record SeedOutcome(
    SeedTime? Opened = null,
    SeedTime? Paid = null,
    SeedTime? PaymentFailed = null,
    (SeedTime At, string Reason)? Declined = null,
    SeedTime? Expired = null,
    (SeedTime At, string TripNumber)? Trip = null,
    SeedTime? Started = null,
    SeedTime? Delivered = null);

internal sealed record SeedOrder(
    string OrderNumber,
    string Company,
    SeedTime Submitted,
    Location Pickup,
    SeedTime PickupAt,
    Location Destination,
    SeedTime? DeliverBy,
    CargoDetails Cargo,
    VehicleType Vehicle,
    int DistanceKm,
    SeedQuote? Quote = null,
    SeedOutcome? Outcome = null);

/// <summary>
/// The orders the coordinator web mocks show (apps/web/src/features/orders/mocks), copied so the pages look the same
/// against the real API. Customers, addresses and fares are mock data, not real records. Dates are shifted so open
/// orders always have their pickup ahead and closed orders lie in the past, whatever day the data is seeded.
/// </summary>
internal static class DevOrderSeeds
{
    /// <summary>Per-km rates the frames use (plan §6: configuration until Fleet owns vehicle types).</summary>
    public static decimal RatePerKm(VehicleType type) => type switch
    {
        VehicleType.Light5t => 150,
        VehicleType.Heavy9t => 210,
        _ => 260,
    };

    /// <summary>The seeded coordinator who sends the quotations ("Nimal Perera" in the frames).</summary>
    public static readonly Guid CoordinatorUserId = Guid.Parse("019a0000-0000-7000-8000-00000000c001");

    public static readonly IReadOnlyDictionary<string, (Guid UserId, CustomerSnapshot Snapshot)> Customers =
        new Dictionary<string, (Guid, CustomerSnapshot)>
        {
            ["Lanka Tiles PLC"] = (Id(1), new("Lanka Tiles PLC", "Dilini Perera", "077 214 5590", "orders@lankatiles.lk")),
            ["Kandy Builders"] = (Id(2), new("Kandy Builders", "Ravindu Silva", "077 318 2264", "orders@kandybuilders.lk")),
            ["Nova Electricals"] = (Id(3), new("Nova Electricals", "Ruwan Silva", "077 455 2310", "orders@novaelectricals.lk")),
            ["Ceylon Agro Ltd"] = (Id(4), new("Ceylon Agro Ltd", "Nuwan Perera", "077 602 1189", "ops@ceylonagro.lk")),
            ["Southern Fisheries"] = (Id(5), new("Southern Fisheries", "Pradeep Senanayake", "091 223 4410", "dispatch@southernfisheries.lk")),
            ["Matale Spice Exports"] = (Id(6), new("Matale Spice Exports", "Chamari Wijesinghe", "066 222 8174", "logistics@matalespice.lk")),
            ["Hayleys Freight"] = (Id(7), new("Hayleys Freight", "Asela Gunawardena", "011 762 3300", "bookings@hayleysfreight.lk")),
            ["Colombo Pharma"] = (Id(8), new("Colombo Pharma", "Dr. Shanika Fernando", "077 890 4412", "supply@colombopharma.lk")),
        };

    private static Guid Id(int n) => Guid.Parse($"019a0000-0000-7000-8000-0000000c{n:D4}");

    private static SeedTime T(int day, int hour, int minute = 0) => new(day, hour, minute);

    private static readonly (QuotationLineKind, string, string?, decimal)[] SpiceExportExtras =
    [
        (QuotationLineKind.Load, "Load charge", "5 t", 3000),
        (QuotationLineKind.Handling, "Loading and unloading", "40 drums", 1600),
        (QuotationLineKind.Tolls, "Port gate fee", "Colombo Port", 1780),
    ];

    public static readonly IReadOnlyList<SeedOrder> Orders =
    [
        // ── Needs quotation (Review order frames 123:4232 and 392:13135 / 13377 / 13619) ──
        new("ORD-1054", "Ceylon Agro Ltd", T(0, 11, 5),
            new("Ceylon Agro warehouse, Negombo Road", "Ja-Ela"), T(6, 8),
            new("Rice mill, Polonnaruwa Road", "Dambulla"), T(7, 12),
            new(CargoType.LooseItems, "Machinery", 4200, 3, "Largest 2.4 × 1.2 × 1.5 m", "Forklift at pickup and destination",
                "Each item has lifting points. A forklift is available at both sites."),
            VehicleType.Heavy9t, 148),
        new("ORD-1053", "Kandy Builders", T(0, 10, 51),
            new("Cement depot, Base Line Road", "Peliyagoda"), T(5, 7, 30),
            new("Site office, Peradeniya Road", "Kandy"), T(5, 13),
            new(CargoType.Bags, "Cement", 11500, 230, "50 kg each", "Keep dry, covered truck",
                "Unloading at the site store. Please call Ravindu 30 minutes before arrival."),
            VehicleType.Heavy14t, 116),
        new("ORD-1052", "Nova Electricals", T(0, 10, 44),
            new("No. 18, Kelani Valley Road", "Wellampitiya"), T(4, 9),
            new("Galle Showroom, Wakwella Road", "Galle"), T(4, 16),
            new(CargoType.Cartons, "Electrical goods", 1800, 120, "60 × 40 × 40 cm", "Fragile, keep upright, covered truck",
                "Loading dock is at the back gate. Ask for Ruwan at security."),
            VehicleType.Light5t, 128),
        new("ORD-1049", "Lanka Tiles PLC", T(0, 10, 42),
            new("No. 215, Nawala Road", "Nugegoda"), T(1, 8),
            new("Kurunegala Distribution Yard, Dambulla Road", "Kurunegala"), T(1, 15),
            new(CargoType.Pallets, "Ceramic tiles", 6200, 12, "1.2 × 1.0 m", "Fragile, keep upright",
                "Forklift available at pickup. Please call Dilini 30 minutes before arrival."),
            VehicleType.Heavy9t, 96),
        new("ORD-1048", "Kandy Builders", T(0, 9, 15),
            new("Kandy Builders yard, Peradeniya Road", "Kandy"), T(1, 14),
            new("Site office, Trincomalee Street", "Matale"), T(1, 18),
            new(CargoType.Bags, "Cement", 4000, 80, "50 kg each", "Keep dry, covered truck"),
            VehicleType.Light5t, 26),
        new("ORD-1047", "Southern Fisheries", T(0, 8, 2),
            new("Fishery harbour", "Galle"), T(1, 5, 30),
            new("Fish market, Peliyagoda", "Colombo"), T(1, 9),
            new(CargoType.Cartons, "Chilled seafood", 2500, 60, "Insulated ice boxes", "Refrigerated truck, deliver before 09:00"),
            VehicleType.Light5t, 120),

        // ── Quoted, waiting for the customer ──
        new("ORD-1046", "Ceylon Agro Ltd", T(-1, 16, 40),
            new("Ceylon Agro collection centre, Chilaw Road", "Negombo"), T(2, 7),
            new("Galle Central Market, Main Street", "Galle"), T(2, 12),
            new(CargoType.Pallets, "Fresh produce", 1400, 3, "1.2 × 1.0 m", "Ventilated, keep out of sun"),
            VehicleType.Light5t, 148,
            new(T(-1, 18, 55), T(1, 18),
                [(QuotationLineKind.Handling, "Loading and unloading", "3 pallets", 900),
                 (QuotationLineKind.Special, "Ventilated truck", "Fresh produce", 600),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Southern Expressway", 900)],
                "Includes loading at Negombo and unloading at the market."),
            new(Opened: T(0, 9, 10))),
        new("ORD-1039", "Matale Spice Exports", T(-3, 9, 30),
            new("Matale Spice Exports warehouse, Trincomalee Road", "Matale"), T(3, 6),
            new("Colombo Port, Gate 4 (export cargo)", "Colombo"), T(3, 14),
            new(CargoType.LooseItems, "Spices in sealed containers", 5000, 40, "Sealed drums · 120 kg each",
                "Keep dry, export seals intact", "Export documents travel with the driver. Port gate pass will be emailed the day before."),
            VehicleType.Heavy9t, 142,
            new(T(-3, 15, 10), T(1, 18), SpiceExportExtras,
                "Port gate fee is included. Pickup at 06:00 to reach the port before the export cut-off."),
            new(Opened: T(0, 8, 42))),
        new("ORD-1037", "Southern Fisheries", T(-3, 8, 15),
            new("Southern Fisheries cold store, Harbour Road", "Matara"), T(4, 5),
            new("Fish market, St. Anthony’s Mawatha", "Colombo 15"), T(4, 10),
            new(CargoType.Cartons, "Chilled seafood", 3000, 60, "Insulated ice boxes", "Refrigerated, 0–4 °C"),
            VehicleType.Light5t, 162,
            new(T(-3, 13, 20), T(2, 12),
                [(QuotationLineKind.Special, "Refrigerated truck", "0–4 °C", 12000),
                 (QuotationLineKind.Load, "Load charge", "3 t", 1800),
                 (QuotationLineKind.Handling, "Loading and unloading", "60 boxes", 1500),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Southern Expressway", 2300)],
                "Refrigerated truck at 0–4 °C for the whole trip."),
            new(Opened: T(-1, 17, 30))),

        // ── Accepted and paid: ready for a trip ──
        new("ORD-1045", "Hayleys Freight", T(-1, 9, 5),
            new("Hayleys Freight yard, Puttalam Road", "Kurunegala"), T(2, 7),
            new("Hayleys warehouse, Baseline Road", "Colombo 10"), T(2, 13),
            new(CargoType.Pallets, "General freight", 12000, 18, Handling: "Standard"),
            VehicleType.Heavy14t, 94,
            new(T(-1, 11, 30), T(1, 18),
                [(QuotationLineKind.Load, "Load charge", "12 t", 7200),
                 (QuotationLineKind.Handling, "Loading and unloading", "18 pallets", 3000),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Expressway", 1100)], null),
            new(Opened: T(-1, 12, 2), Paid: T(-1, 12, 10))),
        new("ORD-1044", "Colombo Pharma", T(-1, 8, 20),
            new("Colombo Pharma stores, Galle Road", "Colombo 03"), T(1, 10),
            new("District hospital pharmacy", "Negombo"), T(1, 13),
            new(CargoType.Cartons, "Medicines, cold chain", 800, 42, "Insulated cartons", "Refrigerated, 2–8 °C",
                "Hand over to the chief pharmacist only."),
            VehicleType.Light5t, 38,
            new(T(-1, 10, 15), T(0, 23),
                [(QuotationLineKind.Special, "Cold chain truck", "2–8 °C", 6500),
                 (QuotationLineKind.Handling, "Loading and unloading", "42 cartons", 800),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Katunayake Expressway", 600)],
                "Temperature log is shared with you after delivery."),
            new(Opened: T(-1, 10, 40), Paid: T(-1, 10, 52))),
        new("ORD-1035", "Lanka Tiles PLC", T(-3, 7, 50),
            new("Lanka Tiles showroom yard", "Colombo 15"), T(3, 8),
            new("Lanka Tiles dealer, Anagarika Dharmapala Mawatha", "Matara"), T(3, 15),
            new(CargoType.Pallets, "Ceramic tiles", 8000, 16, "1.2 × 1.0 m", "Fragile, keep upright"),
            VehicleType.Heavy9t, 165,
            new(T(-3, 11, 5), T(-1, 18),
                [(QuotationLineKind.Load, "Load charge", "8 t", 4800),
                 (QuotationLineKind.Handling, "Loading and unloading", "16 pallets", 4000),
                 (QuotationLineKind.Special, "Fragile handling", "Keep upright", 2500),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Southern Expressway", 2300)], null),
            new(Opened: T(-3, 14, 20), Paid: T(-3, 14, 31))),
        new("ORD-1032", "Matale Spice Exports", T(-4, 10, 10),
            new("Matale Spice Exports warehouse, Trincomalee Road", "Matale"), T(4, 6, 30),
            new("Spice packing centre, Katugastota Road", "Kandy"), T(4, 9, 30),
            new(CargoType.Bags, "Spices", 3500, 70, "50 kg each", "Keep dry, covered truck"),
            VehicleType.Light5t, 27,
            new(T(-4, 13, 40), T(-2, 18),
                [(QuotationLineKind.Load, "Load charge", "3.5 t", 2100),
                 (QuotationLineKind.Handling, "Loading and unloading", "70 bags", 1400)], null),
            new(Opened: T(-4, 15, 5), Paid: T(-4, 15, 12))),
        new("ORD-1031", "Ceylon Agro Ltd", T(-4, 8, 45),
            new("Ceylon Agro fertiliser store", "Ja-Ela"), T(5, 7),
            new("Agrarian service centre", "Kurunegala"), T(5, 12),
            new(CargoType.Bags, "Fertiliser", 9000, 180, "50 kg each", "Keep dry, covered truck"),
            VehicleType.Heavy9t, 82,
            new(T(-4, 11, 20), T(-2, 18),
                [(QuotationLineKind.Load, "Load charge", "9 t", 5400),
                 (QuotationLineKind.Handling, "Loading and unloading", "180 bags", 3600),
                 (QuotationLineKind.Special, "Covered truck", "Keep dry", 1500)], null),
            new(Opened: T(-4, 16, 40), Paid: T(-4, 16, 48))),

        // ── Accepted, card payment failed ──
        new("ORD-1042", "Matale Spice Exports", T(-3, 8, 55),
            new("Matale Spice Exports warehouse, Trincomalee Road", "Matale"), T(1, 6),
            new("Colombo Port, Gate 4 (export cargo)", "Colombo"), T(1, 14),
            new(CargoType.LooseItems, "Spices in sealed containers", 5000, 40, "Sealed drums · 120 kg each", "Keep dry, export seals intact"),
            VehicleType.Heavy9t, 142,
            new(T(-3, 10, 30), T(-1, 18), SpiceExportExtras, "Port gate fee is included."),
            new(Opened: T(-3, 12, 15), PaymentFailed: T(-3, 12, 22))),

        // ── Trip running (TRP-2203 in the Trips frames) ──
        new("ORD-1041", "Kandy Builders", T(-4, 9, 40),
            new("Kandy Builders depot, Katugastota Road", "Kandy"), T(0, 8, 30),
            new("Construction site, Flower Road", "Colombo 03"), T(0, 15),
            new(CargoType.Bags, "Cement", 11500, 230, "50 kg each", "Keep dry, covered truck"),
            VehicleType.Heavy14t, 118,
            new(T(-4, 12, 5), T(-2, 18),
                [(QuotationLineKind.Load, "Load charge", "11.5 t", 6900),
                 (QuotationLineKind.Handling, "Loading and unloading", "230 bags", 4600),
                 (QuotationLineKind.Special, "Covered truck", "Keep dry", 1500)], null),
            new(Opened: T(-4, 13, 10), Paid: T(-4, 13, 18), Trip: (T(-3, 9), "TRP-2203"), Started: T(0, 8, 40))),

        // ── Closed ──
        new("ORD-1043", "Lanka Tiles PLC", T(-3, 7, 30),
            new("Colombo Port, Gate 2 (import cargo)", "Colombo"), T(-1, 6, 30),
            new("Lanka Tiles dealer, Peradeniya Road", "Kandy"), T(-1, 13),
            new(CargoType.Pallets, "Ceramic tiles", 8000, 16, Handling: "Fragile, keep upright"),
            VehicleType.Heavy9t, 116,
            new(T(-3, 9, 10), T(-2, 12),
                [(QuotationLineKind.Load, "Load charge", "8 t", 4800),
                 (QuotationLineKind.Handling, "Loading and unloading", "16 pallets", 3000),
                 (QuotationLineKind.Special, "Fragile handling", "Keep upright", 2500),
                 (QuotationLineKind.Tolls, "Port gate fee", "Colombo Port", 1780)], null),
            new(Opened: T(-3, 9, 40), Paid: T(-3, 9, 46), Trip: (T(-3, 11), "TRP-2190"), Started: T(-1, 6, 40), Delivered: T(-1, 11, 40))),
        new("ORD-1040", "Lanka Tiles PLC", T(-5, 10),
            new("Lanka Tiles showroom yard", "Colombo 15"), T(-2, 7),
            new("Kurunegala Distribution Yard, Dambulla Road", "Kurunegala"), T(-2, 13),
            new(CargoType.Pallets, "Ceramic tiles", 9000, 18, Handling: "Fragile, keep upright"),
            VehicleType.Heavy9t, 94,
            new(T(-5, 12, 30), T(-3, 18),
                [(QuotationLineKind.Load, "Load charge", "9 t", 5400),
                 (QuotationLineKind.Handling, "Loading and unloading", "18 pallets", 3000),
                 (QuotationLineKind.Special, "Fragile handling", "Keep upright", 2500),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Expressway", 1100)], null),
            new(Opened: T(-5, 14), Paid: T(-5, 14, 6), Trip: (T(-4, 10, 15), "TRP-2186"), Started: T(-2, 7, 10), Delivered: T(-2, 12, 5))),
        new("ORD-1038", "Hayleys Freight", T(-6, 9, 20),
            new("Hayleys Freight yard, Puttalam Road", "Kurunegala"), T(-2, 6, 30),
            new("Hayleys warehouse, Baseline Road", "Colombo 10"), T(-2, 12),
            new(CargoType.Pallets, "General freight", 10000, 15, Handling: "Standard"),
            VehicleType.Heavy14t, 94,
            new(T(-6, 11), T(-4, 18),
                [(QuotationLineKind.Load, "Load charge", "10 t", 6000),
                 (QuotationLineKind.Handling, "Loading and unloading", "15 pallets", 3000),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Expressway", 1100)], null),
            new(Opened: T(-6, 11, 45), Paid: T(-6, 11, 52), Trip: (T(-5, 9, 30), "TRP-2181"), Started: T(-2, 6, 40), Delivered: T(-2, 10, 20))),
        new("ORD-1036", "Ceylon Agro Ltd", T(-7, 14, 10),
            new("Ceylon Agro machinery yard", "Ja-Ela"), T(-3, 7),
            new("Ceylon Agro farm, Kandalama Road", "Dambulla"), T(-3, 14),
            new(CargoType.LooseItems, "Farm machinery", 4000, 3, "2 power tillers, 1 thresher", "Strap down, crane at pickup"),
            VehicleType.Light5t, 138,
            new(T(-7, 16), T(-5, 18),
                [(QuotationLineKind.Load, "Load charge", "4 t", 2400),
                 (QuotationLineKind.Handling, "Machinery handling", "3 items", 3500)], null),
            new(Opened: T(-6, 8, 30), Paid: T(-6, 8, 41), Trip: (T(-6, 10), "TRP-2178"), Started: T(-3, 7, 15), Delivered: T(-3, 13, 30))),
        new("ORD-1033", "Kandy Builders", T(-8, 11, 30),
            new("Steel stores, Base Line Road", "Peliyagoda"), T(-5, 7),
            new("Site office, Peradeniya Road", "Kandy"), T(-5, 13),
            new(CargoType.LooseItems, "Steel reinforcement bars", 7000, 28, "Bundles · 12 m", "Long load, flatbed"),
            VehicleType.Heavy9t, 116,
            new(T(-8, 14), T(-6, 12),
                [(QuotationLineKind.Load, "Load charge", "7 t", 4200),
                 (QuotationLineKind.Handling, "Loading and unloading", "28 bundles", 2800)], null),
            new(Opened: T(-8, 18, 20), Expired: T(-6, 12))),
        new("ORD-1030", "Southern Fisheries", T(-9, 8),
            new("Southern Fisheries cold store", "Galle"), T(-7, 5),
            new("Peliyagoda central fish market", "Colombo"), T(-7, 9),
            new(CargoType.Cartons, "Chilled seafood", 2000, 40, "Insulated ice boxes", "Refrigerated, 0–4 °C"),
            VehicleType.Light5t, 119,
            new(T(-9, 10, 30), T(-8, 18),
                [(QuotationLineKind.Special, "Refrigerated truck", "0–4 °C", 9000),
                 (QuotationLineKind.Load, "Load charge", "2 t", 1200),
                 (QuotationLineKind.Tolls, "Tolls and fees", "Southern Expressway", 1800)], null),
            new(Opened: T(-9, 12), Declined: (T(-8, 9, 15), "Found a cheaper option for this trip."))),
        new("ORD-1028", "Nova Electricals", T(-10, 13, 45),
            new("Nova Electricals warehouse", "Wellampitiya"), T(-7, 8),
            new("Nova Electricals branch, Dalada Veediya", "Kandy"), T(-7, 16),
            new(CargoType.Cartons, "Electrical goods", 2100, 140, Handling: "Fragile, keep dry"),
            VehicleType.Light5t, 112,
            new(T(-10, 15, 30), T(-8, 12),
                [(QuotationLineKind.Load, "Load charge", "2.1 t", 1300),
                 (QuotationLineKind.Handling, "Loading and unloading", "140 cartons", 2000),
                 (QuotationLineKind.Special, "Fragile handling", "Keep dry", 1500)], null),
            new(Opened: T(-10, 16, 10), Paid: T(-10, 16, 20), Trip: (T(-9, 9), "TRP-2170"), Started: T(-7, 8, 10), Delivered: T(-7, 15, 10))),
    ];
}
