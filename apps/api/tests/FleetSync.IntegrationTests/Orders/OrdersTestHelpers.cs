using System.Collections.Concurrent;
using System.Net.Http.Headers;
using FleetSync.IntegrationTests.Auth;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Orders.Application.Abstractions;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.IntegrationTests.Orders;

/// <summary>Shared steps for the Orders API tests.</summary>
internal static class OrdersTestHelpers
{
    /// <summary>A company name no other test uses, so a search for it only finds this test's orders.</summary>
    public static string UniqueCompany() => $"TestCo{Guid.NewGuid():N}"[..20];

    /// <summary>A client with a real signed access token for the role (the API only checks the token, not an account).</summary>
    public static HttpClient ClientFor(AuthApiFactory factory, string role)
    {
        var issuer = factory.Services.GetRequiredService<AccessTokenIssuer>();
        var user = new ApplicationUser { Id = Guid.CreateVersion7(), Email = $"{role}@example.com", FullName = "Test User" };
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", issuer.Issue(user, [role]).Token);
        return client;
    }

    /// <summary>Saves an order (optionally with a sent quotation) straight through the domain and returns its number.</summary>
    public static async Task<string> CreateOrderAsync(
        AuthApiFactory factory, string company, bool quoted = false, int minutesAgo = 5, string contactEmail = "orders@lankatiles.lk")
    {
        var now = DateTimeOffset.UtcNow;
        var submitted = now.AddMinutes(-minutesAgo);
        var number = $"ORD-T{Random.Shared.Next(10_000_000, 99_999_999)}";

        var order = TransportOrder.Submit(
            number,
            Guid.CreateVersion7(),
            customerCompanyId: null,
            new CustomerSnapshot(company, "Dilini Perera", "077 214 5590", contactEmail),
            new Location("No. 215, Nawala Road", "Nugegoda"),
            new Location("Kurunegala Distribution Yard", "Kurunegala"),
            now.AddDays(2),
            null,
            new CargoDetails(CargoType.Pallets, "Ceramic tiles", 6200, 12),
            VehicleType.Heavy9t,
            submitted);

        if (quoted)
        {
            order.SendQuotation(
                $"QT-T{Random.Shared.Next(10_000_000, 99_999_999)}",
                VehicleType.Heavy9t,
                96,
                [
                    new QuotationLine(QuotationLineKind.Distance, "Distance charge", "96 km × LKR 210", 20160, 0),
                    new QuotationLine(QuotationLineKind.Load, "Load charge", "6.2 t", 7500, 1),
                ],
                now.AddDays(1),
                null,
                Guid.CreateVersion7(),
                submitted.AddMinutes(1));
        }

        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return number;
    }
}

/// <summary>Keeps the Orders module's emails in memory instead of writing files.</summary>
internal sealed class CapturingOrderEmailSender : IOrderEmailSender
{
    private readonly ConcurrentQueue<OrderEmail> _sent = new();

    public Task SendAsync(OrderEmail email, CancellationToken cancellationToken)
    {
        _sent.Enqueue(email);
        return Task.CompletedTask;
    }

    /// <summary>The newest email whose subject mentions the text, or null.</summary>
    public OrderEmail? Latest(string subjectContains) =>
        _sent.Reverse().FirstOrDefault(e => e.Subject.Contains(subjectContains, StringComparison.Ordinal));
}
