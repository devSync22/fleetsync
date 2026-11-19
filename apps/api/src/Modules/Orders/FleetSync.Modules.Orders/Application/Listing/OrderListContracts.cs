using FleetSync.Modules.Orders.Domain;
using FluentValidation;

namespace FleetSync.Modules.Orders.Application.Listing;

/// <summary>The tabs of Submitted orders; also the <c>?tab=</c> value (same ids as the web's orderTabs.ts).</summary>
internal static class OrderTabs
{
    public const string AllOpen = "all-open";
    public const string NeedsQuotation = "needs-quotation";
    public const string Quoted = "quoted";
    public const string ReadyForTrip = "ready-for-trip";
    public const string Closed = "closed";

    public static readonly IReadOnlyList<string> All = [AllOpen, NeedsQuotation, Quoted, ReadyForTrip, Closed];

    /// <summary>Which tab an order with this status and payment counts under, besides All open.</summary>
    public static string? SpecificTab(OrderStatus status, OrderPaymentStatus payment) => status switch
    {
        OrderStatus.PendingReview => NeedsQuotation,
        OrderStatus.Quoted => Quoted,
        OrderStatus.Accepted when payment == OrderPaymentStatus.Paid => ReadyForTrip,
        _ when TransportOrder.IsClosedStatus(status) => Closed,
        _ => null,
    };
}

/// <summary>
/// <c>GET /api/orders</c> query string. Search matches order number, customer and either city;
/// pickupDate is a Sri Lankan calendar day (yyyy-MM-dd).
/// </summary>
internal sealed record OrderListQuery(string? Tab, string? Search, DateOnly? PickupDate, int? Page, int? PageSize)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public string TabOrDefault => string.IsNullOrWhiteSpace(Tab) ? OrderTabs.AllOpen : Tab;

    public int PageOrDefault => Page ?? 1;

    public int PageSizeOrDefault => PageSize ?? DefaultPageSize;
}

internal sealed class OrderListQueryValidator : AbstractValidator<OrderListQuery>
{
    public OrderListQueryValidator()
    {
        RuleFor(q => q.TabOrDefault)
            .Must(tab => OrderTabs.All.Contains(tab))
            .WithMessage($"Use one of: {string.Join(", ", OrderTabs.All)}.")
            .OverridePropertyName(nameof(OrderListQuery.Tab));
        RuleFor(q => q.Search).MaximumLength(100);
        RuleFor(q => q.Page).GreaterThanOrEqualTo(1);
        RuleFor(q => q.PageSize).InclusiveBetween(1, OrderListQuery.MaxPageSize);
    }
}

/// <summary>The current quotation, as the list shows it (amount, how long it stays valid, whether it was opened).</summary>
internal sealed record QuotationSummary(
    string QuotationNumber,
    decimal Total,
    DateTimeOffset? SentAt,
    DateTimeOffset ValidUntil,
    int ViewCount,
    DateTimeOffset? LastViewedAt);

/// <summary>One row of Submitted orders.</summary>
internal sealed record OrderListItem(
    string OrderNumber,
    DateTimeOffset SubmittedAt,
    string CustomerName,
    string PickupCity,
    string DestinationCity,
    DateTimeOffset PickupAt,
    CargoType CargoType,
    string CargoDescription,
    int UnitsCount,
    decimal WeightKg,
    OrderStatus Status,
    OrderPaymentStatus PaymentStatus,
    QuotationSummary? Quotation,
    string? TripNumber,
    DateTimeOffset? ClosedAt);

/// <summary>
/// One page of the active tab, plus how many orders each tab holds for the same search and pickup date
/// (the counts on the tab bar).
/// </summary>
internal sealed record OrderListResponse(
    IReadOnlyList<OrderListItem> Items,
    int Page,
    int PageSize,
    int TotalCount,
    IReadOnlyDictionary<string, int> TabCounts);
