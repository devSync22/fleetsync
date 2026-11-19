using System.Text.Json.Serialization;

namespace FleetSync.Modules.Orders.Domain;

// Status and type values agreed in docs/design/orders-module-plan.md §2–§3 (DI-14).
// Stored as strings; sent as kebab-case JSON ("pending-review"), matching both web apps.

/// <summary>Where a transport order is in its life.</summary>
internal enum OrderStatus
{
    PendingReview,
    Quoted,
    Accepted,
    TripScheduled,
    InProgress,
    Completed,
    Declined,
    QuotationExpired,
    Cancelled,
}

/// <summary>
/// The customer's side of the money, as the Orders module shows it. A projection: the Payments module owns the
/// payments themselves and updates this value.
/// </summary>
internal enum OrderPaymentStatus
{
    NotDue,
    AwaitingPayment,
    Paid,
    PaymentFailed,
    Refunded,
    NoPayment,
}

/// <summary>
/// A fare quotation's life. A sent quotation is never edited: re-quoting supersedes it (BR-32).
/// </summary>
internal enum QuotationStatus
{
    Draft,
    Sent,
    Accepted,
    Declined,
    Expired,
    Superseded,
}

/// <summary>How the cargo is packed; decides which units the customer entered (DI-12).</summary>
internal enum CargoType
{
    Pallets,
    Bags,
    Cartons,
    LooseItems,
}

/// <summary>
/// Vehicle classes a quotation can be priced for (DI-11, DI-12). The JSON names are pinned to the web's
/// <c>VehicleClass</c> values; kebab-casing the member names would give "light5t".
/// </summary>
internal enum VehicleType
{
    [JsonStringEnumMemberName("light-5")]
    Light5t,

    [JsonStringEnumMemberName("heavy-9")]
    Heavy9t,

    [JsonStringEnumMemberName("heavy-14")]
    Heavy14t,
}

/// <summary>Something that happened to an order; the history timeline both web apps show (plan §2, DI-30).</summary>
internal enum OrderEventType
{
    Submitted,
    QuotationSent,
    QuotationOpened,
    QuotationAccepted,
    PaymentReceived,
    PaymentFailed,
    QuotationDeclined,
    QuotationExpired,
    TripScheduled,
    TripStarted,
    Delivered,
    Cancelled,
}

/// <summary>What a quotation line charges for. Distance lines are km × the vehicle type's rate.</summary>
internal enum QuotationLineKind
{
    Distance,
    Load,
    Handling,
    Special,
    Tolls,
    Other,
}
