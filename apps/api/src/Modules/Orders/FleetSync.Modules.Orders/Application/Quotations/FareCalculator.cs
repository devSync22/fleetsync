using System.Globalization;
using FleetSync.Modules.Orders.Domain;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Orders.Application.Quotations;

/// <summary>
/// The distance charge: km × the vehicle type's rate (<see cref="OrdersOptions.FareRates"/>). Always calculated
/// here, never taken from the client, so the main line of a quotation can't be priced by hand.
/// </summary>
internal sealed class FareCalculator(IOptions<OrdersOptions> options)
{
    public decimal RatePerKm(VehicleType type) =>
        options.Value.FareRates.TryGetValue(type, out var rate)
            ? rate
            : throw new InvalidOperationException($"No fare rate is configured for {type} (Orders:FareRates).");

    public QuotationLine DistanceLine(int distanceKm, VehicleType type)
    {
        var rate = RatePerKm(type);
        return new QuotationLine(
            QuotationLineKind.Distance,
            "Distance charge",
            $"{distanceKm} km × LKR {rate.ToString("#,##0.##", CultureInfo.InvariantCulture)}",
            distanceKm * rate,
            sortOrder: 0);
    }
}
