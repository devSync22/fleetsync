using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Orders.Application.Details;

/// <summary>Everything the coordinator's Review order / Order details page shows for one order.</summary>
internal sealed record OrderDetailResponse(
    string OrderNumber,
    OrderStatus Status,
    OrderPaymentStatus PaymentStatus,
    DateTimeOffset SubmittedAt,
    CustomerResponse Customer,
    LocationResponse Pickup,
    DateTimeOffset PickupAt,
    LocationResponse Destination,
    DateTimeOffset? DeliverBy,
    int? DistanceKm,
    CargoResponse Cargo,
    VehicleType? RequiredVehicleType,
    QuotationResponse? Quotation,
    string? TripNumber,
    DateTimeOffset? ClosedAt,
    IReadOnlyList<OrderEventResponse> History);

/// <summary>Use case "Review Customer Order" (the read part) and "View order details".</summary>
internal sealed class OrderDetailService(OrdersDbContext db)
{
    public async Task<Result<OrderDetailResponse>> GetAsync(string orderNumber, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .AsSplitQuery()
            .Include(o => o.Quotations)
            .Include(o => o.Events)
            .SingleOrDefaultAsync(o => o.OrderNumber == orderNumber.Trim().ToUpperInvariant(), cancellationToken);

        if (order is null)
        {
            return OrderErrors.NotFound(orderNumber);
        }

        return new OrderDetailResponse(
            order.OrderNumber,
            order.Status,
            order.PaymentStatus,
            order.CreatedAt,
            order.Customer.ToResponse(),
            order.Pickup.ToResponse(),
            order.PickupAt,
            order.Destination.ToResponse(),
            order.DeliverBy,
            order.DistanceKm,
            order.Cargo.ToResponse(),
            order.RequiredVehicleType,
            order.CurrentQuotation?.ToResponse(),
            order.TripNumber,
            order.ClosedAt,
            [.. order.Events.OrderBy(e => e.OccurredAt).Select(e => e.ToResponse())]);
    }
}
