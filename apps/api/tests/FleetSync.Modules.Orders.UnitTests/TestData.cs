using FleetSync.Modules.Orders.Application.Abstractions;
using FleetSync.Modules.Orders.Domain;

namespace FleetSync.Modules.Orders.UnitTests;

internal static class TestData
{
    public static readonly DateTimeOffset Now = new(2026, 11, 17, 4, 30, 0, TimeSpan.Zero);

    public static readonly Guid Customer = Guid.Parse("019a0000-0000-7000-8000-0000000000c1");

    public static readonly Guid Coordinator = Guid.Parse("019a0000-0000-7000-8000-0000000000c2");

    public static TransportOrder NewOrder(DateTimeOffset? now = null) => TransportOrder.Submit(
        "ORD-1049",
        Customer,
        customerCompanyId: null,
        new CustomerSnapshot("Lanka Tiles PLC", "Dilini Perera", "077 214 5590", "orders@lankatiles.lk"),
        new Location("No. 215, Nawala Road", "Nugegoda"),
        new Location("Kurunegala Distribution Yard", "Kurunegala"),
        (now ?? Now).AddDays(2),
        (now ?? Now).AddDays(2).AddHours(7),
        new CargoDetails(CargoType.Pallets, "Ceramic tiles", 6200, 12, "1.2 × 1.0 m", "Fragile, keep upright"),
        VehicleType.Heavy9t,
        now ?? Now);

    public static QuotationLine[] Lines() =>
    [
        new(QuotationLineKind.Distance, "Distance charge", "96 km × LKR 210", 20160, 0),
        new(QuotationLineKind.Load, "Load charge", "6.2 t", 4500, 1),
        new(QuotationLineKind.Handling, "Loading and unloading", "12 pallets", 3000, 2),
    ];

    /// <summary>An order with a sent quotation valid for one day.</summary>
    public static TransportOrder QuotedOrder()
    {
        var order = NewOrder();
        order.SendQuotation("QT-2026-0001", VehicleType.Heavy9t, 96, Lines(), Now.AddDays(1), "Includes unloading.", Coordinator, Now.AddHours(1));
        return order;
    }

    /// <summary>Hands out QT-2026-0001, 0002… without a database.</summary>
    public sealed class FakeNumbers : IOrderNumbers
    {
        private int _order = 1100;
        private int _quotation;

        public Task<string> NextOrderNumberAsync(CancellationToken cancellationToken) =>
            Task.FromResult($"ORD-{_order++}");

        public Task<string> NextQuotationNumberAsync(CancellationToken cancellationToken) =>
            Task.FromResult($"QT-2026-{++_quotation:D4}");
    }
}
