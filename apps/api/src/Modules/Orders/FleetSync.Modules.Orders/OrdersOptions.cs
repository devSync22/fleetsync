using FleetSync.Modules.Orders.Domain;

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

    /// <summary>
    /// LKR per km for each vehicle type; the distance charge of every quotation is km × this rate.
    /// Configuration until the Fleet module owns vehicle types and the pricing method is decided (plan §6, OI-07).
    /// </summary>
    public Dictionary<VehicleType, decimal> FareRates { get; set; } = new()
    {
        [VehicleType.Light5t] = 150,
        [VehicleType.Heavy9t] = 210,
        [VehicleType.Heavy14t] = 260,
    };

    /// <summary>
    /// The customer's quotation page in the web app; <c>{orderNumber}</c> is replaced. Used in the quotation email.
    /// </summary>
    public string CustomerQuotationUrl { get; set; } = "http://localhost:5173/customer/quotations/{orderNumber}";

    /// <summary>Development email sender: where emails are saved as text files instead of being sent.</summary>
    public string EmailPickupDirectory { get; set; } = "App_Data/dev-emails";
}
