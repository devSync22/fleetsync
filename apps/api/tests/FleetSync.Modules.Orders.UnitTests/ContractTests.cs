using System.Text.Json;
using System.Text.Json.Serialization;
using FleetSync.Modules.Orders.Domain;

namespace FleetSync.Modules.Orders.UnitTests;

/// <summary>
/// The JSON values the web apps switch on (plan §3). The host serializes enums as kebab-case, so these tests use
/// the same converter. Members are passed by name because the enums are internal to the module.
/// </summary>
public sealed class ContractTests
{
    private static readonly JsonSerializerOptions HostJson = new()
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.KebabCaseLower) },
    };

    private static string Json<T>(string member) where T : struct, Enum =>
        JsonSerializer.Serialize(Enum.Parse<T>(member), HostJson).Trim('"');

    [Theory]
    [InlineData(nameof(OrderStatus.PendingReview), "pending-review")]
    [InlineData(nameof(OrderStatus.Quoted), "quoted")]
    [InlineData(nameof(OrderStatus.Accepted), "accepted")]
    [InlineData(nameof(OrderStatus.TripScheduled), "trip-scheduled")]
    [InlineData(nameof(OrderStatus.InProgress), "in-progress")]
    [InlineData(nameof(OrderStatus.Completed), "completed")]
    [InlineData(nameof(OrderStatus.Declined), "declined")]
    [InlineData(nameof(OrderStatus.QuotationExpired), "quotation-expired")]
    [InlineData(nameof(OrderStatus.Cancelled), "cancelled")]
    public void OrderStatus_MatchesTheWebValues(string member, string json) =>
        Assert.Equal(json, Json<OrderStatus>(member));

    [Theory]
    [InlineData(nameof(OrderPaymentStatus.NotDue), "not-due")]
    [InlineData(nameof(OrderPaymentStatus.AwaitingPayment), "awaiting-payment")]
    [InlineData(nameof(OrderPaymentStatus.Paid), "paid")]
    [InlineData(nameof(OrderPaymentStatus.PaymentFailed), "payment-failed")]
    [InlineData(nameof(OrderPaymentStatus.Refunded), "refunded")]
    [InlineData(nameof(OrderPaymentStatus.NoPayment), "no-payment")]
    public void PaymentStatus_MatchesTheWebValues(string member, string json) =>
        Assert.Equal(json, Json<OrderPaymentStatus>(member));

    [Theory]
    [InlineData(nameof(VehicleType.Light5t), "light-5")]
    [InlineData(nameof(VehicleType.Heavy9t), "heavy-9")]
    [InlineData(nameof(VehicleType.Heavy14t), "heavy-14")]
    public void VehicleType_MatchesTheWebVehicleClass(string member, string json) =>
        Assert.Equal(json, Json<VehicleType>(member));

    [Fact]
    public void VehicleType_ReadsTheWebValuesBack() =>
        Assert.Equal(VehicleType.Heavy14t, JsonSerializer.Deserialize<VehicleType>("\"heavy-14\"", HostJson));
}
