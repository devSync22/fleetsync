using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;
using FleetSync.Application.Security;
using FleetSync.IntegrationTests.Auth;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.IntegrationTests.Orders;

/// <summary>
/// GET /api/orders and GET /api/orders/{orderNumber} against PostgreSQL: tabs, search, paging, details, history,
/// and who may call them. Every test creates its own orders under a unique company name and searches for it, so
/// tests never see each other's rows in the shared test database.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class OrdersApiTests(AuthApiFactory factory)
{
    private static readonly DateTimeOffset Now = DateTimeOffset.UtcNow;

    [Fact]
    public async Task List_ShowsOpenOrders_WithTabCounts()
    {
        var company = UniqueCompany();
        await CreateAsync(company, quoted: false);
        await CreateAsync(company, quoted: false);
        await CreateAsync(company, quoted: true);

        var body = await GetJsonAsync($"/api/orders?search={company}");

        Assert.Equal(3, body.GetProperty("totalCount").GetInt32());
        var counts = body.GetProperty("tabCounts");
        Assert.Equal(3, counts.GetProperty("all-open").GetInt32());
        Assert.Equal(2, counts.GetProperty("needs-quotation").GetInt32());
        Assert.Equal(1, counts.GetProperty("quoted").GetInt32());
        Assert.Equal(0, counts.GetProperty("closed").GetInt32());

        var first = body.GetProperty("items")[0];
        Assert.Equal(company, first.GetProperty("customerName").GetString());
        Assert.Equal("pallets", first.GetProperty("cargoType").GetString());
    }

    [Fact]
    public async Task List_FiltersByTab_AndShowsTheQuotationSummary()
    {
        var company = UniqueCompany();
        await CreateAsync(company, quoted: false);
        var quoted = await CreateAsync(company, quoted: true);

        var body = await GetJsonAsync($"/api/orders?tab=quoted&search={company}");

        var item = Assert.Single(body.GetProperty("items").EnumerateArray());
        Assert.Equal(quoted, item.GetProperty("orderNumber").GetString());
        Assert.Equal("quoted", item.GetProperty("status").GetString());
        Assert.Equal("awaiting-payment", item.GetProperty("paymentStatus").GetString());
        Assert.Equal(27660m, item.GetProperty("quotation").GetProperty("total").GetDecimal());
    }

    [Fact]
    public async Task List_Pages_NewestFirst()
    {
        var company = UniqueCompany();
        await CreateAsync(company, quoted: false, minutesAgo: 30);
        var newest = await CreateAsync(company, quoted: false, minutesAgo: 1);

        var body = await GetJsonAsync($"/api/orders?search={company}&pageSize=1");

        Assert.Equal(2, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(1, body.GetProperty("pageSize").GetInt32());
        Assert.Equal(newest, body.GetProperty("items")[0].GetProperty("orderNumber").GetString());
    }

    [Theory]
    [InlineData("tab=everything")]
    [InlineData("pageSize=500")]
    [InlineData("page=0")]
    public async Task List_RejectsBadQueries(string query)
    {
        var response = await CoordinatorClient().GetAsync($"/api/orders?{query}");

        await AuthTestHelpers.AssertProblemAsync(response, HttpStatusCode.BadRequest, "validation_failed");
    }

    [Fact]
    public async Task Details_IncludeCustomerRouteCargoQuotationAndHistory()
    {
        var company = UniqueCompany();
        var number = await CreateAsync(company, quoted: true);

        var body = await GetJsonAsync($"/api/orders/{number}");

        Assert.Equal(number, body.GetProperty("orderNumber").GetString());
        Assert.Equal("Dilini Perera", body.GetProperty("customer").GetProperty("contactName").GetString());
        Assert.Equal("Kurunegala", body.GetProperty("destination").GetProperty("city").GetString());
        Assert.Equal(12, body.GetProperty("cargo").GetProperty("unitsCount").GetInt32());

        var quotation = body.GetProperty("quotation");
        Assert.Equal("heavy-9", quotation.GetProperty("vehicleType").GetString());
        Assert.Equal(2, quotation.GetProperty("lines").GetArrayLength());

        var history = body.GetProperty("history").EnumerateArray().Select(e => e.GetProperty("title").GetString()).ToList();
        Assert.Equal(["Order submitted", "Quotation sent · LKR 27,660"], history);
    }

    [Fact]
    public async Task Details_UnknownOrder_Is404()
    {
        var response = await CoordinatorClient().GetAsync("/api/orders/ORD-0");

        await AuthTestHelpers.AssertProblemAsync(response, HttpStatusCode.NotFound, "orders.not_found");
    }

    [Theory]
    [InlineData(FleetSyncRoles.Customer)]
    [InlineData(FleetSyncRoles.Driver)]
    [InlineData(FleetSyncRoles.Mechanic)]
    [InlineData(FleetSyncRoles.Owner)]
    [InlineData(FleetSyncRoles.FleetAdministrator)]
    public async Task OtherRoles_Get403(string role)
    {
        var client = ClientFor(role);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/orders")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/orders/ORD-1049")).StatusCode);
    }

    [Fact]
    public async Task SignedOut_Gets401()
    {
        var response = await factory.CreateClient().GetAsync("/api/orders");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private static string UniqueCompany() => $"TestCo{Guid.NewGuid():N}"[..20];

    private async Task<JsonElement> GetJsonAsync(string path) =>
        await AuthTestHelpers.ReadJsonAsync(await CoordinatorClient().GetAsync(path));

    private HttpClient CoordinatorClient() => ClientFor(FleetSyncRoles.Coordinator);

    /// <summary>A client with a real signed access token for the role (no account needed: the API only checks the token).</summary>
    private HttpClient ClientFor(string role)
    {
        var issuer = factory.Services.GetRequiredService<AccessTokenIssuer>();
        var user = new ApplicationUser { Id = Guid.CreateVersion7(), Email = $"{role}@example.com", FullName = "Test User" };
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", issuer.Issue(user, [role]).Token);
        return client;
    }

    /// <summary>Saves an order (optionally with a sent quotation) straight through the domain and returns its number.</summary>
    private async Task<string> CreateAsync(string company, bool quoted, int minutesAgo = 5)
    {
        var submitted = Now.AddMinutes(-minutesAgo);
        var number = $"ORD-T{Random.Shared.Next(10_000_000, 99_999_999)}";

        var order = TransportOrder.Submit(
            number,
            Guid.CreateVersion7(),
            customerCompanyId: null,
            new CustomerSnapshot(company, "Dilini Perera", "077 214 5590", "orders@lankatiles.lk"),
            new Location("No. 215, Nawala Road", "Nugegoda"),
            new Location("Kurunegala Distribution Yard", "Kurunegala"),
            Now.AddDays(2),
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
                Now.AddDays(1),
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
