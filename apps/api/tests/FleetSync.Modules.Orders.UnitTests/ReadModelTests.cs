using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Application.Listing;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Seeding;
using static FleetSync.Modules.Orders.UnitTests.TestData;

namespace FleetSync.Modules.Orders.UnitTests;

/// <summary>Tabs, history wording, local time and the development seed data.</summary>
public sealed class ReadModelTests
{
    [Theory]
    [InlineData(nameof(OrderStatus.PendingReview), nameof(OrderPaymentStatus.NotDue), OrderTabs.NeedsQuotation)]
    [InlineData(nameof(OrderStatus.Quoted), nameof(OrderPaymentStatus.AwaitingPayment), OrderTabs.Quoted)]
    [InlineData(nameof(OrderStatus.Accepted), nameof(OrderPaymentStatus.Paid), OrderTabs.ReadyForTrip)]
    [InlineData(nameof(OrderStatus.Completed), nameof(OrderPaymentStatus.Paid), OrderTabs.Closed)]
    [InlineData(nameof(OrderStatus.Declined), nameof(OrderPaymentStatus.NoPayment), OrderTabs.Closed)]
    [InlineData(nameof(OrderStatus.Cancelled), nameof(OrderPaymentStatus.Refunded), OrderTabs.Closed)]
    public void Orders_FallUnderTheSameTabsAsTheWeb(string status, string payment, string tab) =>
        Assert.Equal(tab, OrderTabs.SpecificTab(Enum.Parse<OrderStatus>(status), Enum.Parse<OrderPaymentStatus>(payment)));

    [Theory]
    [InlineData(nameof(OrderStatus.Accepted), nameof(OrderPaymentStatus.AwaitingPayment))]
    [InlineData(nameof(OrderStatus.Accepted), nameof(OrderPaymentStatus.PaymentFailed))]
    [InlineData(nameof(OrderStatus.TripScheduled), nameof(OrderPaymentStatus.Paid))]
    [InlineData(nameof(OrderStatus.InProgress), nameof(OrderPaymentStatus.Paid))]
    public void UnpaidOrRunningOrders_AreOnlyInAllOpen(string status, string payment) =>
        Assert.Null(OrderTabs.SpecificTab(Enum.Parse<OrderStatus>(status), Enum.Parse<OrderPaymentStatus>(payment)));

    [Fact]
    public void History_UsesTheWebTimelineWording()
    {
        var order = QuotedOrder();
        order.RecordQuotationViewed(Now.AddHours(2));

        var history = order.Events.Select(e => e.ToResponse()).ToList();

        Assert.Equal(["Order submitted", "Quotation sent · LKR 27,660", "Customer opened the quotation"], history.Select(h => h.Title));
        Assert.Equal([EventTone.Neutral, EventTone.Accent, EventTone.Info], history.Select(h => h.Tone));
    }

    [Fact]
    public void PickupDateFilter_UsesTheSriLankanDay()
    {
        var (start, end) = LocalTime.DayBounds(new DateOnly(2026, 11, 17));

        // Midnight in Colombo (UTC+05:30) is 18:30 UTC the day before.
        Assert.Equal(new DateTimeOffset(2026, 11, 16, 18, 30, 0, TimeSpan.Zero), start);
        Assert.Equal(TimeSpan.FromDays(1), end - start);
    }

    [Fact]
    public async Task EverySeedOrder_FollowsTheDomainRules()
    {
        var numbers = new FakeNumbers();
        var today = new DateOnly(2026, 11, 17);

        List<TransportOrder> orders = [];
        foreach (var seed in DevOrderSeeds.Orders)
        {
            orders.Add(await DevOrdersSeeder.BuildAsync(seed, today, numbers, CancellationToken.None));
        }

        Assert.Equal(23, orders.Count);
        Assert.Equal(orders.Count, orders.Select(o => o.OrderNumber).Distinct().Count());

        var byStatus = orders.GroupBy(o => o.Status).ToDictionary(g => g.Key, g => g.Count());
        Assert.Equal(6, byStatus[OrderStatus.PendingReview]);
        Assert.Equal(3, byStatus[OrderStatus.Quoted]);
        Assert.Equal(6, byStatus[OrderStatus.Accepted]);
        Assert.Equal(1, byStatus[OrderStatus.InProgress]);
        Assert.Equal(5, byStatus[OrderStatus.Completed]);
        Assert.Equal(1, byStatus[OrderStatus.QuotationExpired]);
        Assert.Equal(1, byStatus[OrderStatus.Declined]);

        // The three quoted totals match the web list (plan: mocks kept consistent).
        Assert.Equal(24600m, Total("ORD-1046"));
        Assert.Equal(36200m, Total("ORD-1039"));
        Assert.Equal(41900m, Total("ORD-1037"));

        Assert.Equal(OrderPaymentStatus.PaymentFailed, orders.Single(o => o.OrderNumber == "ORD-1042").PaymentStatus);
        Assert.Equal("TRP-2203", orders.Single(o => o.OrderNumber == "ORD-1041").TripNumber);

        decimal Total(string number) => orders.Single(o => o.OrderNumber == number).CurrentQuotation!.Total;
    }
}
