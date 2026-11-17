using System.Globalization;
using FleetSync.Modules.Orders.Domain;

namespace FleetSync.Modules.Orders.Application.Common;

/// <summary>Colour of a history entry; the web's Status Badge tones.</summary>
internal enum EventTone
{
    Neutral,
    Accent,
    Info,
    Success,
    Pending,
    Danger,
}

internal sealed record CustomerResponse(string CompanyName, string ContactName, string? ContactPhone, string ContactEmail);

internal sealed record LocationResponse(string Address, string City, string? ContactName, string? ContactPhone);

internal sealed record CargoResponse(
    CargoType Type,
    string Description,
    decimal WeightKg,
    int UnitsCount,
    string? UnitsDetail,
    string? Handling,
    string? Note);

internal sealed record QuotationLineResponse(QuotationLineKind Kind, string Label, string? Detail, decimal Amount);

/// <summary>A sent quotation and the customer's response so far.</summary>
internal sealed record QuotationResponse(
    string QuotationNumber,
    QuotationStatus Status,
    VehicleType VehicleType,
    IReadOnlyList<QuotationLineResponse> Lines,
    decimal Total,
    DateTimeOffset ValidUntil,
    string? MessageToCustomer,
    DateTimeOffset? SentAt,
    DateTimeOffset? RespondedAt,
    string? DeclineReason,
    int ViewCount,
    DateTimeOffset? FirstViewedAt,
    DateTimeOffset? LastViewedAt);

/// <summary>One history entry, with the title and colour the web shows.</summary>
internal sealed record OrderEventResponse(
    OrderEventType Type,
    string Title,
    string? Detail,
    DateTimeOffset OccurredAt,
    EventTone Tone);

/// <summary>Maps domain objects to the API's response records.</summary>
internal static class OrderMapping
{
    public static CustomerResponse ToResponse(this CustomerSnapshot c) =>
        new(c.CompanyName, c.ContactName, c.ContactPhone, c.ContactEmail);

    public static LocationResponse ToResponse(this Location l) =>
        new(l.Address, l.City, l.ContactName, l.ContactPhone);

    public static CargoResponse ToResponse(this CargoDetails c) =>
        new(c.Type, c.Description, c.WeightKg, c.UnitsCount, c.UnitsDetail, c.Handling, c.Note);

    public static QuotationResponse ToResponse(this FareQuotation q) => new(
        q.QuotationNumber,
        q.Status,
        q.VehicleType,
        [.. q.Lines.OrderBy(l => l.SortOrder).Select(l => new QuotationLineResponse(l.Kind, l.Label, l.Detail, l.Amount))],
        q.Total,
        q.ValidUntil,
        q.MessageToCustomer,
        q.SentAt,
        q.RespondedAt,
        q.DeclineReason,
        q.ViewCount,
        q.FirstViewedAt,
        q.LastViewedAt);

    /// <summary>The wording and colour of each history entry (matches the web's order timeline).</summary>
    public static OrderEventResponse ToResponse(this OrderEvent e)
    {
        var (title, detail, tone) = e.Type switch
        {
            OrderEventType.Submitted => ("Order submitted", e.Detail, EventTone.Neutral),
            OrderEventType.QuotationSent => ($"Quotation sent · {Lkr(e.Amount)}", e.Detail, EventTone.Accent),
            OrderEventType.QuotationOpened => ("Customer opened the quotation", e.Detail, EventTone.Info),
            OrderEventType.QuotationAccepted => ("Quotation accepted", e.Detail, EventTone.Accent),
            OrderEventType.PaymentReceived => ($"Paid · {Lkr(e.Amount)}", "Card payment via PayHere", EventTone.Success),
            OrderEventType.PaymentFailed => ("Card payment failed", "The customer can retry the payment from their account", EventTone.Danger),
            OrderEventType.QuotationDeclined => ("Declined by the customer", e.Detail, EventTone.Danger),
            OrderEventType.QuotationExpired => ("Quotation expired", "The customer did not answer before it expired", EventTone.Neutral),
            OrderEventType.TripScheduled => ($"Trip {e.Detail} scheduled", null, EventTone.Accent),
            OrderEventType.TripStarted => ("Trip started", e.Detail, EventTone.Info),
            OrderEventType.Delivered => ("Delivered", e.Detail, EventTone.Success),
            OrderEventType.Cancelled => ("Order cancelled", e.Detail, EventTone.Danger),
            _ => (e.Type.ToString(), e.Detail, EventTone.Neutral),
        };

        return new OrderEventResponse(e.Type, title, detail, e.OccurredAt, tone);
    }

    /// <summary>"LKR 36,200".</summary>
    private static string Lkr(decimal? amount) =>
        "LKR " + (amount ?? 0).ToString("#,##0.##", CultureInfo.InvariantCulture);
}
