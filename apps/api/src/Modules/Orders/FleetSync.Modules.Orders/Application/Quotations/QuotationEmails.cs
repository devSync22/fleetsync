using System.Globalization;
using System.Text;
using FleetSync.Modules.Orders.Application.Abstractions;
using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;

namespace FleetSync.Modules.Orders.Application.Quotations;

/// <summary>The "Send Fare Quotation Email" text (use case: Review Customer Order → Prepare Fare Estimation).</summary>
internal static class QuotationEmails
{
    private static readonly CultureInfo Invariant = CultureInfo.InvariantCulture;

    public static OrderEmail Sent(TransportOrder order, FareQuotation quotation, string quotationUrl)
    {
        var validUntil = TimeZoneInfo.ConvertTime(quotation.ValidUntil, LocalTime.Zone);
        var body = new StringBuilder()
            .AppendLine($"Dear {order.Customer.ContactName},")
            .AppendLine()
            .AppendLine($"Your fare quotation for order {order.OrderNumber} ({order.Pickup.City} → {order.Destination.City}) is ready.")
            .AppendLine()
            .AppendLine($"Quotation {quotation.QuotationNumber}");

        foreach (var line in quotation.Lines.OrderBy(l => l.SortOrder))
        {
            var detail = line.Detail is null ? string.Empty : $" ({line.Detail})";
            body.AppendLine($"  {line.Label}{detail}: {Lkr(line.Amount)}");
        }

        body.AppendLine($"  Total: {Lkr(quotation.Total)}")
            .AppendLine()
            .AppendLine($"Valid until {validUntil.ToString("d MMM yyyy, HH:mm", Invariant)} (Sri Lanka time).");

        if (quotation.MessageToCustomer is { } message)
        {
            body.AppendLine().AppendLine(message);
        }

        body.AppendLine()
            .AppendLine("Open it to accept and pay by card, or decline:")
            .AppendLine(quotationUrl)
            .AppendLine()
            .AppendLine("FleetSync");

        return new OrderEmail(
            order.Customer.ContactEmail,
            $"Fare quotation ready · {order.OrderNumber}",
            body.ToString());
    }

    private static string Lkr(decimal amount) => "LKR " + amount.ToString("#,##0.00", Invariant);
}
