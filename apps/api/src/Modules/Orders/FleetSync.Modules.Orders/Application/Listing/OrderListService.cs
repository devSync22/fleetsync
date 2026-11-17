using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Orders.Application.Listing;

/// <summary>Use cases "View Submitted Orders", "Search / Filter Orders" and "View Orders Payment Status".</summary>
internal sealed class OrderListService(OrdersDbContext db)
{
    public async Task<OrderListResponse> ListAsync(OrderListQuery query, CancellationToken cancellationToken)
    {
        var filtered = ApplySearchAndDate(db.Orders.AsNoTracking(), query);

        // Tab counts for the same search and date: one grouped query instead of one per tab.
        var groups = await filtered
            .GroupBy(o => new { o.Status, o.PaymentStatus })
            .Select(g => new { g.Key.Status, g.Key.PaymentStatus, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var tabCounts = OrderTabs.All.ToDictionary(tab => tab, _ => 0);
        foreach (var group in groups)
        {
            if (!TransportOrder.IsClosedStatus(group.Status))
            {
                tabCounts[OrderTabs.AllOpen] += group.Count;
            }

            if (OrderTabs.SpecificTab(group.Status, group.PaymentStatus) is { } specificTab)
            {
                tabCounts[specificTab] += group.Count;
            }
        }

        var tab = query.TabOrDefault;
        var inTab = ApplyTab(filtered, tab);
        var pageSize = query.PageSizeOrDefault;
        var page = query.PageOrDefault;

        // Closed orders read best by when they closed; open ones by when they came in.
        var ordered = tab == OrderTabs.Closed
            ? inTab.OrderByDescending(o => o.ClosedAt).ThenByDescending(o => o.CreatedAt)
            : inTab.OrderByDescending(o => o.CreatedAt);

        var items = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItem(
                o.OrderNumber,
                o.CreatedAt,
                o.Customer.CompanyName,
                o.Pickup.City,
                o.Destination.City,
                o.PickupAt,
                o.Cargo.Type,
                o.Cargo.Description,
                o.Cargo.UnitsCount,
                o.Cargo.WeightKg,
                o.Status,
                o.PaymentStatus,
                o.Quotations
                    .Where(q => q.Status != QuotationStatus.Draft && q.Status != QuotationStatus.Superseded)
                    .OrderByDescending(q => q.SentAt)
                    .Select(q => new QuotationSummary(q.QuotationNumber, q.Total, q.SentAt, q.ValidUntil, q.ViewCount, q.LastViewedAt))
                    .FirstOrDefault(),
                o.TripNumber,
                o.ClosedAt))
            .ToListAsync(cancellationToken);

        return new OrderListResponse(items, page, pageSize, tabCounts[tab], tabCounts);
    }

    private static IQueryable<TransportOrder> ApplySearchAndDate(IQueryable<TransportOrder> orders, OrderListQuery query)
    {
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{EscapeLike(query.Search.Trim())}%";
            orders = orders.Where(o =>
                EF.Functions.ILike(o.OrderNumber, pattern, "\\")
                || EF.Functions.ILike(o.Customer.CompanyName, pattern, "\\")
                || EF.Functions.ILike(o.Pickup.City, pattern, "\\")
                || EF.Functions.ILike(o.Destination.City, pattern, "\\"));
        }

        if (query.PickupDate is { } day)
        {
            var (start, end) = LocalTime.DayBounds(day);
            orders = orders.Where(o => o.PickupAt >= start && o.PickupAt < end);
        }

        return orders;
    }

    private static IQueryable<TransportOrder> ApplyTab(IQueryable<TransportOrder> orders, string tab) => tab switch
    {
        OrderTabs.NeedsQuotation => orders.Where(o => o.Status == OrderStatus.PendingReview),
        OrderTabs.Quoted => orders.Where(o => o.Status == OrderStatus.Quoted),
        OrderTabs.ReadyForTrip => orders.Where(o => o.Status == OrderStatus.Accepted && o.PaymentStatus == OrderPaymentStatus.Paid),
        OrderTabs.Closed => orders.Where(o =>
            o.Status == OrderStatus.Completed || o.Status == OrderStatus.Declined
            || o.Status == OrderStatus.QuotationExpired || o.Status == OrderStatus.Cancelled),
        _ => orders.Where(o =>
            o.Status != OrderStatus.Completed && o.Status != OrderStatus.Declined
            && o.Status != OrderStatus.QuotationExpired && o.Status != OrderStatus.Cancelled),
    };

    /// <summary>Makes %, _ and \ in the user's text match literally.</summary>
    private static string EscapeLike(string text) =>
        text.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
