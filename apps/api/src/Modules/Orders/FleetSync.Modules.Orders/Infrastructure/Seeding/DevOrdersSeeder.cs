using FleetSync.Modules.Orders.Application.Abstractions;
using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Orders.Infrastructure.Seeding;

/// <summary>
/// Development only (and only with <c>Orders:SeedDevelopmentData</c>): when the <c>orders</c> schema has no orders,
/// creates the ones the coordinator web mocks show (plan §7), through the same domain methods the API uses.
/// The development database is shared (ADR-0003), so it never touches existing data.
/// </summary>
internal sealed partial class DevOrdersSeeder(
    IServiceScopeFactory scopeFactory,
    IHostEnvironment environment,
    IOptions<OrdersOptions> options,
    TimeProvider clock,
    ILogger<DevOrdersSeeder> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        if (!environment.IsDevelopment() || !options.Value.SeedDevelopmentData)
        {
            return;
        }

        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
            var numbers = scope.ServiceProvider.GetRequiredService<IOrderNumbers>();

            if (await db.Orders.AnyAsync(cancellationToken))
            {
                return;
            }

            var today = LocalTime.Today(clock);
            await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

            foreach (var seed in DevOrderSeeds.Orders)
            {
                db.Orders.Add(await BuildAsync(seed, today, numbers, cancellationToken));
            }

            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            LogSeeded(DevOrderSeeds.Orders.Count);
        }
        catch (Exception exception)
        {
            // Usually the orders migration isn't applied yet, or a teammate seeded at the same moment.
            LogSeedError(exception);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>Builds one seed order through the domain methods (internal so a unit test can check every seed).</summary>
    internal static async Task<TransportOrder> BuildAsync(
        SeedOrder seed, DateOnly today, IOrderNumbers numbers, CancellationToken cancellationToken)
    {
        DateTimeOffset At(SeedTime t) => LocalTime.At(today.AddDays(t.Day), new TimeOnly(t.Hour, t.Minute));

        var (customerUserId, customer) = DevOrderSeeds.Customers[seed.Company];
        var order = TransportOrder.Submit(
            seed.OrderNumber,
            customerUserId,
            customerCompanyId: null,
            customer,
            seed.Pickup,
            seed.Destination,
            At(seed.PickupAt),
            seed.DeliverBy is { } deliverBy ? At(deliverBy) : null,
            seed.Cargo,
            seed.Vehicle,
            At(seed.Submitted));

        if (seed.Quote is not { } quote)
        {
            return order;
        }

        var distanceCharge = seed.DistanceKm * DevOrderSeeds.RatePerKm(seed.Vehicle);
        List<QuotationLine> lines =
        [
            new(QuotationLineKind.Distance, "Distance charge",
                $"{seed.DistanceKm} km × LKR {DevOrderSeeds.RatePerKm(seed.Vehicle):0}", distanceCharge, 0),
            .. quote.Extras.Select((e, i) => new QuotationLine(e.Kind, e.Label, e.Detail, e.Amount, i + 1)),
        ];

        order.SendQuotation(
            await numbers.NextQuotationNumberAsync(cancellationToken),
            seed.Vehicle,
            seed.DistanceKm,
            lines,
            At(quote.ValidUntil),
            quote.Message,
            DevOrderSeeds.CoordinatorUserId,
            At(quote.SentAt));

        var outcome = seed.Outcome ?? new SeedOutcome();
        if (outcome.Opened is { } opened)
        {
            order.RecordQuotationViewed(At(opened));
        }

        // The customer accepts a minute before the card result comes back, so the history keeps that order.
        if (outcome.Paid is { } paid)
        {
            order.AcceptQuotation(At(paid).AddMinutes(-1));
            order.RecordPayment(succeeded: true, reference: null, At(paid));
        }

        if (outcome.PaymentFailed is { } failed)
        {
            order.AcceptQuotation(At(failed).AddMinutes(-1));
            order.RecordPayment(succeeded: false, reference: null, At(failed));
        }

        if (outcome.Declined is { } declined)
        {
            order.DeclineQuotation(declined.Reason, At(declined.At));
        }

        if (outcome.Expired is { } expired)
        {
            order.ExpireQuotation(At(expired));
        }

        if (outcome.Trip is { } trip)
        {
            order.ScheduleTrip(Guid.CreateVersion7(), trip.TripNumber, DevOrderSeeds.CoordinatorUserId, At(trip.At));
        }

        if (outcome.Started is { } started)
        {
            order.StartTrip(driverUserId: null, At(started));
        }

        if (outcome.Delivered is { } delivered)
        {
            order.Complete(driverUserId: null, At(delivered));
        }

        return order;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Seeded {Count} development orders.")]
    private partial void LogSeeded(int count);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Development orders not seeded. Is the orders migration applied?")]
    private partial void LogSeedError(Exception exception);
}
