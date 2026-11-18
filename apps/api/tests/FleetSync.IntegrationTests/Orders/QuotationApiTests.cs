using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FleetSync.Application.Security;
using FleetSync.IntegrationTests.Auth;
using static FleetSync.IntegrationTests.Orders.OrdersTestHelpers;

namespace FleetSync.IntegrationTests.Orders;

/// <summary>
/// Prepare quote → Send quotation → Quotation details against PostgreSQL: the draft, server-side pricing of the
/// distance charge, the status change, the customer email, and the 400 / 404 / 409 / 403 cases.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class QuotationApiTests(AuthApiFactory factory)
{
    /// <summary>96 km on a 9 t truck (LKR 210/km = 20,160) plus two hand-priced lines (7,500) = 27,660.</summary>
    private static object ValidSend(int validForHours = 24) => new
    {
        vehicleType = "heavy-9",
        distanceKm = 96,
        lines = new[]
        {
            new { kind = "load", label = "Load charge", detail = "6.2 t", amount = 4500m },
            new { kind = "handling", label = "Loading and unloading", detail = "12 pallets", amount = 3000m },
        },
        validUntil = DateTimeOffset.UtcNow.AddHours(validForHours),
        message = "Price includes loading and unloading of all 12 pallets.",
    };

    [Fact]
    public async Task FareRates_ListEveryVehicleType()
    {
        var rates = await ReadAsync(await Coordinator().GetAsync("/api/orders/fare-rates"));

        var byType = rates.EnumerateArray().ToDictionary(r => r.GetProperty("vehicleType").GetString()!, r => r.GetProperty("ratePerKm").GetDecimal());
        Assert.Equal(150m, byType["light-5"]);
        Assert.Equal(210m, byType["heavy-9"]);
        Assert.Equal(260m, byType["heavy-14"]);
    }

    [Fact]
    public async Task Draft_IsSaved_AndComesBackWithTheOrder()
    {
        var number = await CreateOrderAsync(factory, UniqueCompany());

        var saved = await Coordinator().PutAsJsonAsync($"/api/orders/{number}/quotation/draft", new
        {
            vehicleType = "light-5",
            distanceKm = 96,
            lines = new[] { new { kind = "special", label = "Fragile handling", detail = (string?)null, amount = 2500m } },
            validUntil = (DateTimeOffset?)null,
            message = "Draft only",
        });
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);

        var order = await ReadAsync(await Coordinator().GetAsync($"/api/orders/{number}"));
        var draft = order.GetProperty("draft");
        Assert.Equal("light-5", draft.GetProperty("vehicleType").GetString());
        Assert.Equal("Fragile handling", draft.GetProperty("lines")[0].GetProperty("label").GetString());
        Assert.Equal("pending-review", order.GetProperty("status").GetString());
    }

    [Fact]
    public async Task Send_PricesTheDistance_QuotesTheOrder_AndEmailsTheCustomer()
    {
        var email = $"buyer-{Guid.NewGuid():N}@example.com";
        var number = await CreateOrderAsync(factory, UniqueCompany(), contactEmail: email);

        var response = await Coordinator().PostAsJsonAsync($"/api/orders/{number}/quotation/send", ValidSend());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.EndsWith($"/api/orders/{number}/quotation", response.Headers.Location?.ToString());

        var sent = await ReadAsync(response);
        var quotation = sent.GetProperty("quotation");
        Assert.Equal("quoted", sent.GetProperty("orderStatus").GetString());
        Assert.Equal("awaiting-payment", sent.GetProperty("paymentStatus").GetString());
        Assert.StartsWith("QT-", quotation.GetProperty("quotationNumber").GetString());
        Assert.Equal(27660m, quotation.GetProperty("total").GetDecimal());

        var distance = quotation.GetProperty("lines")[0];
        Assert.Equal("distance", distance.GetProperty("kind").GetString());
        Assert.Equal(20160m, distance.GetProperty("amount").GetDecimal());

        var mail = factory.OrderEmails.Latest(number);
        Assert.NotNull(mail);
        Assert.Equal(email, mail.To);
        Assert.Contains("LKR 27,660.00", mail.Body);
        Assert.Contains($"/customer/quotations/{number}", mail.Body);

        // The order itself moved to Quoted, its draft is gone, and the history says so.
        var order = await ReadAsync(await Coordinator().GetAsync($"/api/orders/{number}"));
        Assert.Equal("quoted", order.GetProperty("status").GetString());
        Assert.Equal(JsonValueKind.Null, order.GetProperty("draft").ValueKind);
        Assert.Equal("Quotation sent · LKR 27,660", order.GetProperty("history")[1].GetProperty("title").GetString());
    }

    [Fact]
    public async Task Send_Twice_Is409AlreadyQuoted()
    {
        var number = await CreateOrderAsync(factory, UniqueCompany());
        (await Coordinator().PostAsJsonAsync($"/api/orders/{number}/quotation/send", ValidSend())).EnsureSuccessStatusCode();

        var again = await Coordinator().PostAsJsonAsync($"/api/orders/{number}/quotation/send", ValidSend());

        await AuthTestHelpers.AssertProblemAsync(again, HttpStatusCode.Conflict, "orders.already_quoted");
    }

    [Fact]
    public async Task Draft_OnAQuotedOrder_Is409()
    {
        var number = await CreateOrderAsync(factory, UniqueCompany(), quoted: true);

        var response = await Coordinator().PutAsJsonAsync($"/api/orders/{number}/quotation/draft", new { vehicleType = "heavy-9" });

        await AuthTestHelpers.AssertProblemAsync(response, HttpStatusCode.Conflict, "orders.already_quoted");
    }

    [Fact]
    public async Task Quotation_IsShownOnceSent_And404Before()
    {
        var pending = await CreateOrderAsync(factory, UniqueCompany());
        var quoted = await CreateOrderAsync(factory, UniqueCompany(), quoted: true);

        await AuthTestHelpers.AssertProblemAsync(
            await Coordinator().GetAsync($"/api/orders/{pending}/quotation"), HttpStatusCode.NotFound, "orders.no_quotation");

        var details = await ReadAsync(await Coordinator().GetAsync($"/api/orders/{quoted}/quotation"));
        Assert.Equal(quoted, details.GetProperty("orderNumber").GetString());
        Assert.Equal("Kurunegala", details.GetProperty("destinationCity").GetString());
        Assert.Equal(27660m, details.GetProperty("quotation").GetProperty("total").GetDecimal());
    }

    [Fact]
    public async Task Send_ToAnUnknownOrder_Is404()
    {
        var response = await Coordinator().PostAsJsonAsync("/api/orders/ORD-0/quotation/send", ValidSend());

        await AuthTestHelpers.AssertProblemAsync(response, HttpStatusCode.NotFound, "orders.not_found");
    }

    public static TheoryData<string, object> InvalidSends => new()
    {
        { "validUntil", new { vehicleType = "heavy-9", distanceKm = 96, validUntil = DateTimeOffset.UtcNow.AddHours(-1) } },
        { "validUntil", new { vehicleType = "heavy-9", distanceKm = 96, validUntil = DateTimeOffset.UtcNow.AddDays(45) } },
        { "distanceKm", new { vehicleType = "heavy-9", validUntil = DateTimeOffset.UtcNow.AddDays(1) } },
        {
            "lines[0].kind",
            new
            {
                vehicleType = "heavy-9", distanceKm = 96, validUntil = DateTimeOffset.UtcNow.AddDays(1),
                lines = new[] { new { kind = "distance", label = "Distance charge", amount = 1m } },
            }
        },
        {
            "lines[0].amount",
            new
            {
                vehicleType = "heavy-9", distanceKm = 96, validUntil = DateTimeOffset.UtcNow.AddDays(1),
                lines = new[] { new { kind = "other", label = "Discount", amount = -500m } },
            }
        },
    };

    [Theory]
    [MemberData(nameof(InvalidSends))]
    public async Task Send_RejectsInvalidQuotations(string field, object body)
    {
        var number = await CreateOrderAsync(factory, UniqueCompany());

        var response = await Coordinator().PostAsJsonAsync($"/api/orders/{number}/quotation/send", body);

        var problem = await AuthTestHelpers.AssertProblemAsync(response, HttpStatusCode.BadRequest, "validation_failed");
        Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _), $"Expected an error for {field}.");
    }

    [Theory]
    [InlineData(FleetSyncRoles.Customer)]
    [InlineData(FleetSyncRoles.Owner)]
    public async Task OtherRoles_CannotSendOrDraft(string role)
    {
        var number = await CreateOrderAsync(factory, UniqueCompany());
        var client = ClientFor(factory, role);

        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync($"/api/orders/{number}/quotation/send", ValidSend())).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PutAsJsonAsync($"/api/orders/{number}/quotation/draft", new { vehicleType = "heavy-9" })).StatusCode);
    }

    private HttpClient Coordinator() => ClientFor(factory, FleetSyncRoles.Coordinator);

    private static Task<JsonElement> ReadAsync(HttpResponseMessage response) => AuthTestHelpers.ReadJsonAsync(response);
}
