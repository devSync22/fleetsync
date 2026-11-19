using System.Net;
using System.Text.Json;
using FleetSync.Application.Security;
using FleetSync.IntegrationTests.Auth;

namespace FleetSync.IntegrationTests.Orders;

/// <summary>
/// GET /api/orders and GET /api/orders/{orderNumber} against PostgreSQL: tabs, search, paging, details, history,
/// and who may call them. Every test creates its own orders under a unique company name and searches for it, so
/// tests never see each other's rows in the shared test database.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class OrdersApiTests(AuthApiFactory factory)
{
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

    private static string UniqueCompany() => OrdersTestHelpers.UniqueCompany();

    private async Task<JsonElement> GetJsonAsync(string path) =>
        await AuthTestHelpers.ReadJsonAsync(await CoordinatorClient().GetAsync(path));

    private HttpClient CoordinatorClient() => ClientFor(FleetSyncRoles.Coordinator);

    private HttpClient ClientFor(string role) => OrdersTestHelpers.ClientFor(factory, role);

    private Task<string> CreateAsync(string company, bool quoted, int minutesAgo = 5) =>
        OrdersTestHelpers.CreateOrderAsync(factory, company, quoted, minutesAgo);
}
