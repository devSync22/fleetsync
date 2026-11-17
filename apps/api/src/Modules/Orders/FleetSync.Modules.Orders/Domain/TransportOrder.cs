namespace FleetSync.Modules.Orders.Domain;

/// <summary>
/// A customer's transport order (EER TRANSPORT_ORDER + DI-12) and the rules for how it moves through its statuses
/// (plan §3). Every change goes through a method here, which also writes the matching <see cref="OrderEvent"/>.
/// Customer-side transitions (accept, decline, pay) live here too so both sides of the module share one set of rules.
/// </summary>
internal sealed class TransportOrder
{
    private readonly List<FareQuotation> _quotations = [];
    private readonly List<OrderEvent> _events = [];

    private TransportOrder()
    {
    }

    public Guid Id { get; private set; }

    /// <summary>"ORD-1049": what people and URLs use. The GUID stays the key.</summary>
    public string OrderNumber { get; private set; } = string.Empty;

    public Guid CustomerUserId { get; private set; }

    public Guid? CustomerCompanyId { get; private set; }

    public CustomerSnapshot Customer { get; private set; } = null!;

    public Location Pickup { get; private set; } = null!;

    public Location Destination { get; private set; } = null!;

    public DateTimeOffset PickupAt { get; private set; }

    /// <summary>"Deliver before …", when the customer asked for one.</summary>
    public DateTimeOffset? DeliverBy { get; private set; }

    public CargoDetails Cargo { get; private set; } = null!;

    public VehicleType? RequiredVehicleType { get; private set; }

    /// <summary>Entered by the coordinator while quoting (no route API, no GPS).</summary>
    public int? DistanceKm { get; private set; }

    public OrderStatus Status { get; private set; }

    public OrderPaymentStatus PaymentStatus { get; private set; }

    /// <summary>The coordinator who reviewed and quoted it (EER "Reviews order").</summary>
    public Guid? ReviewedByUserId { get; private set; }

    public Guid? TripId { get; private set; }

    public string? TripNumber { get; private set; }

    /// <summary>When the customer submitted it.</summary>
    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset UpdatedAt { get; private set; }

    /// <summary>Set when the order reaches a closed status.</summary>
    public DateTimeOffset? ClosedAt { get; private set; }

    /// <summary>PostgreSQL xmin: two coordinators changing the same order can't overwrite each other.</summary>
    public uint Version { get; private set; }

    public IReadOnlyList<FareQuotation> Quotations => _quotations;

    public IReadOnlyList<OrderEvent> Events => _events;

    /// <summary>The quotation the customer is answering or answered (the newest one that was sent).</summary>
    public FareQuotation? CurrentQuotation =>
        _quotations
            .Where(q => q.Status is not (QuotationStatus.Draft or QuotationStatus.Superseded))
            .MaxBy(q => q.SentAt);

    public bool IsClosed => IsClosedStatus(Status);

    public static bool IsClosedStatus(OrderStatus status) =>
        status is OrderStatus.Completed or OrderStatus.Declined or OrderStatus.QuotationExpired or OrderStatus.Cancelled;

    public bool CanSendQuotation => Status == OrderStatus.PendingReview;

    public bool CanBeAccepted(DateTimeOffset now) =>
        Status == OrderStatus.Quoted && CurrentQuotation is { } quotation && !quotation.IsExpiredAt(now);

    public bool CanRecordPayment =>
        Status == OrderStatus.Accepted && PaymentStatus is OrderPaymentStatus.AwaitingPayment or OrderPaymentStatus.PaymentFailed;

    public bool CanScheduleTrip => Status == OrderStatus.Accepted && PaymentStatus == OrderPaymentStatus.Paid;

    /// <summary>The cargo-pickup rule (DI-06) belongs to the Trips module, which checks it before calling <see cref="Cancel"/>.</summary>
    public bool CanBeCancelled =>
        Status is OrderStatus.Accepted or OrderStatus.TripScheduled or OrderStatus.InProgress;

    /// <summary>A customer places an order (the customer side of the module).</summary>
    public static TransportOrder Submit(
        string orderNumber,
        Guid customerUserId,
        Guid? customerCompanyId,
        CustomerSnapshot customer,
        Location pickup,
        Location destination,
        DateTimeOffset pickupAt,
        DateTimeOffset? deliverBy,
        CargoDetails cargo,
        VehicleType? requiredVehicleType,
        DateTimeOffset now)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(orderNumber);
        if (pickupAt <= now)
        {
            throw new ArgumentException("The pickup must be in the future.", nameof(pickupAt));
        }

        if (deliverBy is not null && deliverBy <= pickupAt)
        {
            throw new ArgumentException("Delivery must be after pickup.", nameof(deliverBy));
        }

        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(cargo.WeightKg);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(cargo.UnitsCount);

        var order = new TransportOrder
        {
            Id = Guid.CreateVersion7(now),
            OrderNumber = orderNumber,
            CustomerUserId = customerUserId,
            CustomerCompanyId = customerCompanyId,
            Customer = customer,
            Pickup = pickup,
            Destination = destination,
            PickupAt = pickupAt,
            DeliverBy = deliverBy,
            Cargo = cargo,
            RequiredVehicleType = requiredVehicleType,
            Status = OrderStatus.PendingReview,
            PaymentStatus = OrderPaymentStatus.NotDue,
            CreatedAt = now,
            UpdatedAt = now,
        };
        order.Record(OrderEventType.Submitted, now, customerUserId);
        return order;
    }

    /// <summary>The coordinator sends a fare quotation: the order becomes Quoted and payment falls due on acceptance.</summary>
    public FareQuotation SendQuotation(
        string quotationNumber,
        VehicleType vehicleType,
        int distanceKm,
        IReadOnlyList<QuotationLine> lines,
        DateTimeOffset validUntil,
        string? message,
        Guid coordinatorUserId,
        DateTimeOffset now)
    {
        Require(CanSendQuotation, "quoted");
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(distanceKm);

        var quotation = FareQuotation.CreateSent(Id, quotationNumber, vehicleType, lines, validUntil, message, coordinatorUserId, now);
        _quotations.Add(quotation);

        DistanceKm = distanceKm;
        ReviewedByUserId = coordinatorUserId;
        Status = OrderStatus.Quoted;
        PaymentStatus = OrderPaymentStatus.AwaitingPayment;
        Record(OrderEventType.QuotationSent, now, coordinatorUserId, quotationNumber, quotation.Total);
        return quotation;
    }

    /// <summary>The customer opened the quotation; only the first view goes into the history.</summary>
    public void RecordQuotationViewed(DateTimeOffset now)
    {
        Require(Status == OrderStatus.Quoted && CurrentQuotation is not null, "opened");
        if (CurrentQuotation!.RecordView(now))
        {
            Record(OrderEventType.QuotationOpened, now, CustomerUserId);
        }
        else
        {
            UpdatedAt = now;
        }
    }

    public void AcceptQuotation(DateTimeOffset now)
    {
        Require(CanBeAccepted(now), "accepted");
        CurrentQuotation!.MarkAccepted(now);
        Status = OrderStatus.Accepted;
        Record(OrderEventType.QuotationAccepted, now, CustomerUserId);
    }

    /// <summary>The Payments module reports the result of a card payment (PayHere).</summary>
    public void RecordPayment(bool succeeded, string? reference, DateTimeOffset now)
    {
        Require(CanRecordPayment, "paid");
        PaymentStatus = succeeded ? OrderPaymentStatus.Paid : OrderPaymentStatus.PaymentFailed;
        Record(
            succeeded ? OrderEventType.PaymentReceived : OrderEventType.PaymentFailed,
            now,
            CustomerUserId,
            reference,
            CurrentQuotation!.Total);
    }

    public void DeclineQuotation(string reason, DateTimeOffset now)
    {
        Require(Status == OrderStatus.Quoted, "declined");
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        CurrentQuotation!.MarkDeclined(reason.Trim(), now);
        Close(OrderStatus.Declined, now);
        Record(OrderEventType.QuotationDeclined, now, CustomerUserId, reason.Trim());
    }

    /// <summary>The customer didn't answer in time.</summary>
    public void ExpireQuotation(DateTimeOffset now)
    {
        Require(Status == OrderStatus.Quoted && CurrentQuotation!.IsExpiredAt(now), "expired");
        CurrentQuotation!.MarkExpired();
        Close(OrderStatus.QuotationExpired, now);
        Record(OrderEventType.QuotationExpired, now);
    }

    /// <summary>The Trips module created the trip for this order.</summary>
    public void ScheduleTrip(Guid tripId, string tripNumber, Guid coordinatorUserId, DateTimeOffset now)
    {
        Require(CanScheduleTrip, "scheduled for a trip");
        ArgumentException.ThrowIfNullOrWhiteSpace(tripNumber);

        TripId = tripId;
        TripNumber = tripNumber;
        Status = OrderStatus.TripScheduled;
        Record(OrderEventType.TripScheduled, now, coordinatorUserId, tripNumber);
    }

    /// <summary>The driver started the trip.</summary>
    public void StartTrip(Guid? driverUserId, DateTimeOffset now)
    {
        Require(Status == OrderStatus.TripScheduled, "started");
        Status = OrderStatus.InProgress;
        Record(OrderEventType.TripStarted, now, driverUserId, TripNumber);
    }

    /// <summary>The driver recorded the delivery.</summary>
    public void Complete(Guid? driverUserId, DateTimeOffset now)
    {
        Require(Status == OrderStatus.InProgress, "completed");
        Close(OrderStatus.Completed, now);
        Record(OrderEventType.Delivered, now, driverUserId, TripNumber);
    }

    /// <summary>
    /// The order is cancelled with its trip. A paid order is refunded in full (DI-06, DI-22); the Payments module
    /// does the refund, this records it.
    /// </summary>
    public void Cancel(string reason, Guid? actorUserId, DateTimeOffset now)
    {
        Require(CanBeCancelled, "cancelled");
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);

        if (PaymentStatus == OrderPaymentStatus.Paid)
        {
            PaymentStatus = OrderPaymentStatus.Refunded;
        }

        Close(OrderStatus.Cancelled, now);
        Record(OrderEventType.Cancelled, now, actorUserId, reason.Trim());
    }

    private void Close(OrderStatus status, DateTimeOffset now)
    {
        Status = status;
        ClosedAt = now;
        if (PaymentStatus is OrderPaymentStatus.NotDue or OrderPaymentStatus.AwaitingPayment)
        {
            PaymentStatus = OrderPaymentStatus.NoPayment;
        }
    }

    private void Record(OrderEventType type, DateTimeOffset now, Guid? actorUserId = null, string? detail = null, decimal? amount = null)
    {
        _events.Add(OrderEvent.Create(Id, type, now, actorUserId, detail, amount));
        UpdatedAt = now;
    }

    private void Require(bool allowed, string action)
    {
        if (!allowed)
        {
            throw new OrderRuleException(OrderNumber, Status, action);
        }
    }
}
