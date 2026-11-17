namespace FleetSync.Modules.Orders.Domain;

/// <summary>
/// One entry of an order's history (plan §2; new table, DI-30). Written by <see cref="TransportOrder"/> on every
/// state change; never edited. The API turns <see cref="Type"/> into the title and colour the web shows.
/// </summary>
internal sealed class OrderEvent
{
    private OrderEvent()
    {
    }

    public Guid Id { get; private set; }

    public Guid OrderId { get; private set; }

    public OrderEventType Type { get; private set; }

    public DateTimeOffset OccurredAt { get; private set; }

    /// <summary>Who did it; null for the system (e.g. a quotation expiring).</summary>
    public Guid? ActorUserId { get; private set; }

    /// <summary>Free text the timeline shows under the title: a decline reason, a quotation or trip number.</summary>
    public string? Detail { get; private set; }

    /// <summary>The LKR amount involved, for quotation and payment events.</summary>
    public decimal? Amount { get; private set; }

    internal static OrderEvent Create(
        Guid orderId,
        OrderEventType type,
        DateTimeOffset occurredAt,
        Guid? actorUserId = null,
        string? detail = null,
        decimal? amount = null) => new()
    {
        Id = Guid.CreateVersion7(occurredAt),
        OrderId = orderId,
        Type = type,
        OccurredAt = occurredAt,
        ActorUserId = actorUserId,
        Detail = detail,
        Amount = amount,
    };
}
