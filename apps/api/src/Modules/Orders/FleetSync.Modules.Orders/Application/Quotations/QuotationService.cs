using System.Text.Json;
using FleetSync.Modules.Orders.Application.Abstractions;
using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Orders.Application.Quotations;

/// <summary>Use case "Review Customer Order" → "Prepare Fare Estimation" → "Send Fare Quotation Email".</summary>
internal sealed partial class QuotationService(
    OrdersDbContext db,
    IOrderNumbers numbers,
    FareCalculator fares,
    IOrderEmailSender emails,
    IOptions<OrdersOptions> options,
    TimeProvider clock,
    ILogger<QuotationService> logger)
{
    public IReadOnlyList<FareRateResponse> GetFareRates() =>
        [.. Enum.GetValues<VehicleType>().Select(type => new FareRateResponse(type, fares.RatePerKm(type)))];

    public async Task<Result<QuotationDraftResponse>> SaveDraftAsync(
        string orderNumber, SaveQuotationDraftRequest request, Guid coordinatorUserId, CancellationToken cancellationToken)
    {
        var order = await FindAsync(orderNumber, cancellationToken);
        if (order is null)
        {
            return OrderErrors.NotFound(orderNumber);
        }

        if (!order.CanSendQuotation)
        {
            return NotQuotable(order, "given a quotation draft");
        }

        var now = clock.GetUtcNow();
        order.SaveQuotationDraft(
            new QuotationDraft(
                request.VehicleType,
                request.DistanceKm,
                [.. (request.Lines ?? []).Select(l => new DraftLine(l.Kind, l.Label.Trim(), Clean(l.Detail), l.Amount))],
                request.ValidUntil,
                Clean(request.Message),
                coordinatorUserId,
                now),
            now);

        if (await SaveAsync(order, cancellationToken) is { } conflict)
        {
            return conflict;
        }

        return ToResponse(order.Draft!);
    }

    public async Task<Result<QuotationDetailsResponse>> SendAsync(
        string orderNumber, SendQuotationRequest request, Guid coordinatorUserId, CancellationToken cancellationToken)
    {
        var order = await FindAsync(orderNumber, cancellationToken);
        if (order is null)
        {
            return OrderErrors.NotFound(orderNumber);
        }

        if (!order.CanSendQuotation)
        {
            return NotQuotable(order, "quoted");
        }

        // The validator guarantees these; the distance charge is always priced here, never by the client.
        var distanceKm = request.DistanceKm!.Value;
        List<QuotationLine> lines =
        [
            fares.DistanceLine(distanceKm, request.VehicleType),
            .. (request.Lines ?? []).Select((l, i) => new QuotationLine(l.Kind, l.Label, l.Detail, l.Amount, i + 1)),
        ];

        var quotation = order.SendQuotation(
            await numbers.NextQuotationNumberAsync(cancellationToken),
            request.VehicleType,
            distanceKm,
            lines,
            request.ValidUntil!.Value,
            Clean(request.Message),
            coordinatorUserId,
            clock.GetUtcNow());

        if (await SaveAsync(order, cancellationToken) is { } conflict)
        {
            return conflict;
        }

        await EmailCustomerAsync(order, quotation, cancellationToken);
        return ToDetails(order, quotation);
    }

    public async Task<Result<QuotationDetailsResponse>> GetAsync(string orderNumber, CancellationToken cancellationToken)
    {
        var order = await db.Orders
            .AsNoTracking()
            .Include(o => o.Quotations)
            .SingleOrDefaultAsync(o => o.OrderNumber == Normalize(orderNumber), cancellationToken);

        if (order is null)
        {
            return OrderErrors.NotFound(orderNumber);
        }

        return order.CurrentQuotation is { } quotation
            ? ToDetails(order, quotation)
            : OrderErrors.NoQuotation(order.OrderNumber);
    }

    public static QuotationDraftResponse ToResponse(QuotationDraft draft) => new(
        draft.VehicleType,
        draft.DistanceKm,
        [.. draft.Lines.Select(l => new QuotationLineRequest(l.Kind, l.Label, l.Detail, l.Amount))],
        draft.ValidUntil,
        draft.Message,
        draft.SavedAt);

    private Task<TransportOrder?> FindAsync(string orderNumber, CancellationToken cancellationToken) =>
        db.Orders
            .Include(o => o.Quotations)
            .SingleOrDefaultAsync(o => o.OrderNumber == Normalize(orderNumber), cancellationToken);

    /// <summary>Saves, turning a lost race with another coordinator into a 409 instead of an overwrite.</summary>
    private async Task<OrderError?> SaveAsync(TransportOrder order, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            return null;
        }
        catch (DbUpdateConcurrencyException)
        {
            return OrderErrors.ConcurrentChange(order.OrderNumber);
        }
    }

    /// <summary>The quotation is already saved; a failed email is logged, not reported as a failed send.</summary>
    private async Task EmailCustomerAsync(TransportOrder order, FareQuotation quotation, CancellationToken cancellationToken)
    {
        try
        {
            var url = options.Value.CustomerQuotationUrl.Replace("{orderNumber}", order.OrderNumber, StringComparison.Ordinal);
            await emails.SendAsync(QuotationEmails.Sent(order, quotation, url), cancellationToken);
        }
        catch (Exception exception)
        {
            LogEmailFailed(exception, order.OrderNumber);
        }
    }

    private static OrderError NotQuotable(TransportOrder order, string action) =>
        order.Status == OrderStatus.Quoted || order.CurrentQuotation is not null
            ? OrderErrors.AlreadyQuoted(order.OrderNumber)
            : OrderErrors.InvalidTransition(order.OrderNumber, JsonNamingPolicy.KebabCaseLower.ConvertName(order.Status.ToString()), action);

    private static QuotationDetailsResponse ToDetails(TransportOrder order, FareQuotation quotation) => new(
        order.OrderNumber,
        order.Status,
        order.PaymentStatus,
        order.Customer.ToResponse(),
        order.Pickup.City,
        order.Destination.City,
        quotation.ToResponse());

    private static string Normalize(string orderNumber) => orderNumber.Trim().ToUpperInvariant();

    private static string? Clean(string? text) => string.IsNullOrWhiteSpace(text) ? null : text.Trim();

    [LoggerMessage(Level = LogLevel.Warning, Message = "Quotation for {OrderNumber} was sent, but the customer email failed.")]
    private partial void LogEmailFailed(Exception exception, string orderNumber);
}
