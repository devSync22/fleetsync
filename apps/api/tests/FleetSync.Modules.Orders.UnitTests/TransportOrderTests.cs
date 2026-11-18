using FleetSync.Modules.Orders.Domain;
using static FleetSync.Modules.Orders.UnitTests.TestData;

namespace FleetSync.Modules.Orders.UnitTests;

/// <summary>The order's status rules (plan §3) and the history each change writes.</summary>
public sealed class TransportOrderTests
{
    [Fact]
    public void Submit_StartsPendingReview_NotDue_WithASubmittedEvent()
    {
        var order = NewOrder();

        Assert.Equal(OrderStatus.PendingReview, order.Status);
        Assert.Equal(OrderPaymentStatus.NotDue, order.PaymentStatus);
        var submitted = Assert.Single(order.Events);
        Assert.Equal(OrderEventType.Submitted, submitted.Type);
        Assert.Equal(Customer, submitted.ActorUserId);
    }

    [Fact]
    public void Submit_KeepsItsOwnCopies_SoOneCustomerCanPlaceManyOrders()
    {
        var customer = new CustomerSnapshot("Lanka Tiles PLC", "Dilini Perera", null, "orders@lankatiles.lk");
        var pickup = new Location("No. 215, Nawala Road", "Nugegoda");
        var destination = new Location("Kurunegala Distribution Yard", "Kurunegala");
        var cargo = new CargoDetails(CargoType.Pallets, "Ceramic tiles", 6200, 12);

        TransportOrder Place(string number) => TransportOrder.Submit(
            number, Customer, null, customer, pickup, destination, Now.AddDays(1), null, cargo, null, Now);

        var first = Place("ORD-1");
        var second = Place("ORD-2");

        // Same values, separate instances: EF Core can't store one owned instance in two orders.
        Assert.Equal(first.Customer, second.Customer);
        Assert.NotSame(first.Customer, second.Customer);
        Assert.NotSame(first.Pickup, second.Pickup);
        Assert.NotSame(first.Destination, second.Destination);
        Assert.NotSame(first.Cargo, second.Cargo);
        Assert.NotSame(customer, first.Customer);
    }

    [Fact]
    public void Submit_RefusesAPickupThatIsNotInTheFuture() =>
        Assert.Throws<ArgumentException>(() => TransportOrder.Submit(
            "ORD-1049",
            Customer,
            customerCompanyId: null,
            new CustomerSnapshot("Lanka Tiles PLC", "Dilini Perera", null, "orders@lankatiles.lk"),
            new Location("No. 215, Nawala Road", "Nugegoda"),
            new Location("Kurunegala Distribution Yard", "Kurunegala"),
            pickupAt: Now,
            deliverBy: null,
            new CargoDetails(CargoType.Pallets, "Ceramic tiles", 6200, 12),
            requiredVehicleType: null,
            now: Now));

    [Fact]
    public void SendQuotation_QuotesTheOrder_AndPaymentFallsDue()
    {
        var order = QuotedOrder();

        Assert.Equal(OrderStatus.Quoted, order.Status);
        Assert.Equal(OrderPaymentStatus.AwaitingPayment, order.PaymentStatus);
        Assert.Equal(96, order.DistanceKm);
        Assert.Equal(Coordinator, order.ReviewedByUserId);

        var quotation = Assert.Single(order.Quotations);
        Assert.Equal(QuotationStatus.Sent, quotation.Status);
        Assert.Equal(27660m, quotation.Total);
        Assert.Same(quotation, order.CurrentQuotation);

        var sent = order.Events[^1];
        Assert.Equal(OrderEventType.QuotationSent, sent.Type);
        Assert.Equal(27660m, sent.Amount);
        Assert.Equal("QT-2026-0001", sent.Detail);
    }

    [Fact]
    public void SendQuotation_Twice_IsRefused()
    {
        var order = QuotedOrder();

        var error = Assert.Throws<OrderRuleException>(() =>
            order.SendQuotation("QT-2026-0002", VehicleType.Heavy9t, 96, Lines(), Now.AddDays(1), null, Coordinator, Now.AddHours(2)));
        Assert.Equal(OrderStatus.Quoted, error.Status);
    }

    [Fact]
    public void SendQuotation_RefusesAZeroTotal()
    {
        var order = NewOrder();

        Assert.Throws<ArgumentException>(() => order.SendQuotation(
            "QT-2026-0001", VehicleType.Light5t, 10,
            [new QuotationLine(QuotationLineKind.Other, "Nothing", null, 0, 0)],
            Now.AddDays(1), null, Coordinator, Now.AddHours(1)));
    }

    [Fact]
    public void SendQuotation_RefusesAValidityInThePast()
    {
        var order = NewOrder();

        Assert.Throws<ArgumentException>(() => order.SendQuotation(
            "QT-2026-0001", VehicleType.Heavy9t, 96, Lines(), Now, null, Coordinator, Now.AddHours(1)));
    }

    [Fact]
    public void QuotationLine_RefusesANegativeAmount() =>
        Assert.Throws<ArgumentOutOfRangeException>(() => new QuotationLine(QuotationLineKind.Other, "Discount", null, -100, 0));

    [Fact]
    public void Viewing_CountsEveryView_ButOnlyTheFirstGoesIntoTheHistory()
    {
        var order = QuotedOrder();

        order.RecordQuotationViewed(Now.AddHours(2));
        order.RecordQuotationViewed(Now.AddHours(3));

        Assert.Equal(2, order.CurrentQuotation!.ViewCount);
        Assert.Equal(Now.AddHours(2), order.CurrentQuotation.FirstViewedAt);
        Assert.Equal(Now.AddHours(3), order.CurrentQuotation.LastViewedAt);
        Assert.Single(order.Events, e => e.Type == OrderEventType.QuotationOpened);
    }

    [Fact]
    public void Accept_ThenPay_MakesTheOrderReadyForATrip()
    {
        var order = QuotedOrder();

        order.AcceptQuotation(Now.AddHours(2));
        Assert.Equal(OrderStatus.Accepted, order.Status);
        Assert.Equal(OrderPaymentStatus.AwaitingPayment, order.PaymentStatus);
        Assert.False(order.CanScheduleTrip);

        order.RecordPayment(succeeded: true, "PAY-58213", Now.AddHours(2));
        Assert.Equal(OrderPaymentStatus.Paid, order.PaymentStatus);
        Assert.True(order.CanScheduleTrip);
        Assert.Equal(QuotationStatus.Accepted, order.CurrentQuotation!.Status);
    }

    [Fact]
    public void Accept_AfterTheQuotationExpired_IsRefused()
    {
        var order = QuotedOrder();

        Assert.False(order.CanBeAccepted(Now.AddDays(1)));
        Assert.Throws<OrderRuleException>(() => order.AcceptQuotation(Now.AddDays(1)));
    }

    [Fact]
    public void FailedPayment_CanBeRetried()
    {
        var order = QuotedOrder();
        order.AcceptQuotation(Now.AddHours(2));

        order.RecordPayment(succeeded: false, null, Now.AddHours(2));
        Assert.Equal(OrderPaymentStatus.PaymentFailed, order.PaymentStatus);

        order.RecordPayment(succeeded: true, "PAY-1", Now.AddHours(3));
        Assert.Equal(OrderPaymentStatus.Paid, order.PaymentStatus);
    }

    [Fact]
    public void Decline_ClosesTheOrder_WithNoPayment()
    {
        var order = QuotedOrder();

        order.DeclineQuotation("Found a cheaper option", Now.AddHours(2));

        Assert.Equal(OrderStatus.Declined, order.Status);
        Assert.Equal(OrderPaymentStatus.NoPayment, order.PaymentStatus);
        Assert.Equal(Now.AddHours(2), order.ClosedAt);
        Assert.Equal("Found a cheaper option", order.CurrentQuotation!.DeclineReason);
        Assert.True(order.IsClosed);
    }

    [Fact]
    public void Expire_OnlyOnceTheValidityHasPassed()
    {
        var order = QuotedOrder();

        Assert.Throws<OrderRuleException>(() => order.ExpireQuotation(Now.AddHours(12)));

        order.ExpireQuotation(Now.AddDays(1));
        Assert.Equal(OrderStatus.QuotationExpired, order.Status);
        Assert.Equal(QuotationStatus.Expired, order.CurrentQuotation!.Status);
        Assert.Equal(OrderPaymentStatus.NoPayment, order.PaymentStatus);
    }

    [Fact]
    public void ScheduleTrip_BeforePayment_IsRefused()
    {
        var order = QuotedOrder();
        order.AcceptQuotation(Now.AddHours(2));

        Assert.Throws<OrderRuleException>(() => order.ScheduleTrip(Guid.NewGuid(), "TRP-2203", Coordinator, Now.AddHours(3)));
    }

    [Fact]
    public void FullLifecycle_EndsCompleted_WithEveryStepInTheHistory()
    {
        var order = PaidOrder();

        order.ScheduleTrip(Guid.NewGuid(), "TRP-2203", Coordinator, Now.AddHours(4));
        order.StartTrip(null, Now.AddDays(2));
        order.Complete(null, Now.AddDays(2).AddHours(6));

        Assert.Equal(OrderStatus.Completed, order.Status);
        Assert.Equal("TRP-2203", order.TripNumber);
        Assert.NotNull(order.ClosedAt);
        Assert.Equal(OrderPaymentStatus.Paid, order.PaymentStatus);
        Assert.Equal(
            [
                OrderEventType.Submitted, OrderEventType.QuotationSent, OrderEventType.QuotationAccepted,
                OrderEventType.PaymentReceived, OrderEventType.TripScheduled, OrderEventType.TripStarted,
                OrderEventType.Delivered,
            ],
            order.Events.Select(e => e.Type));
    }

    [Fact]
    public void Cancel_APaidOrder_RefundsIt()
    {
        var order = PaidOrder();
        order.ScheduleTrip(Guid.NewGuid(), "TRP-2203", Coordinator, Now.AddHours(4));

        order.Cancel("Customer's site closed", Coordinator, Now.AddHours(5));

        Assert.Equal(OrderStatus.Cancelled, order.Status);
        Assert.Equal(OrderPaymentStatus.Refunded, order.PaymentStatus);
        Assert.Equal("Customer's site closed", order.Events[^1].Detail);
    }

    [Fact]
    public void Cancel_BeforeAcceptance_IsRefused()
    {
        var order = QuotedOrder();

        Assert.False(order.CanBeCancelled);
        Assert.Throws<OrderRuleException>(() => order.Cancel("No longer needed", Coordinator, Now.AddHours(2)));
    }

    [Fact]
    public void ClosedOrders_AcceptNoFurtherChanges()
    {
        var order = QuotedOrder();
        order.DeclineQuotation("Too expensive", Now.AddHours(2));

        Assert.Throws<OrderRuleException>(() => order.AcceptQuotation(Now.AddHours(3)));
        Assert.Throws<OrderRuleException>(() => order.Cancel("x", Coordinator, Now.AddHours(3)));
        Assert.Throws<OrderRuleException>(() =>
            order.SendQuotation("QT-2026-0009", VehicleType.Heavy9t, 96, Lines(), Now.AddDays(2), null, Coordinator, Now.AddHours(3)));
    }

    private static TransportOrder PaidOrder()
    {
        var order = QuotedOrder();
        order.AcceptQuotation(Now.AddHours(2));
        order.RecordPayment(succeeded: true, "PAY-1", Now.AddHours(2));
        return order;
    }
}
