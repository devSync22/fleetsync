namespace FleetSync.Modules.Orders;

/// <summary>Settings from the "Orders" configuration section.</summary>
internal sealed class OrdersOptions
{
    public const string SectionName = "Orders";

    /// <summary>
    /// Development only: fill an empty <c>orders</c> schema with the orders the web mocks show (plan §7).
    /// Ignored outside the Development environment.
    /// </summary>
    public bool SeedDevelopmentData { get; set; }
}
