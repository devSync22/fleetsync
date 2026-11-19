using FleetSync.Modules.Orders.Application.Quotations;
using FleetSync.Modules.Orders.Domain;
using FleetSync.Modules.Orders.Infrastructure.Persistence.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Time.Testing;
using static FleetSync.Modules.Orders.UnitTests.TestData;

namespace FleetSync.Modules.Orders.UnitTests;

/// <summary>Drafts, the distance charge, the send rules and the quotation email.</summary>
public sealed class QuotationTests
{
    private static readonly FareCalculator Fares = new(Options.Create(new OrdersOptions()));

    private static QuotationDraft Draft() => new(
        VehicleType.Heavy9t, 96, [new DraftLine(QuotationLineKind.Load, "Load charge", "6.2 t", 4500)], null, "Draft", Coordinator, Now);

    [Fact]
    public void Draft_CanBeSavedWhilePending_AndIsClearedBySending()
    {
        var order = NewOrder();

        order.SaveQuotationDraft(Draft(), Now.AddMinutes(10));
        Assert.Equal(Now.AddMinutes(10), order.Draft!.SavedAt);
        Assert.Single(order.Events); // drafts are not part of the history

        order.SendQuotation("QT-2026-0001", VehicleType.Heavy9t, 96, Lines(), Now.AddDays(1), null, Coordinator, Now.AddHours(1));
        Assert.Null(order.Draft);
    }

    [Fact]
    public void Draft_OnAQuotedOrder_IsRefused() =>
        Assert.Throws<OrderRuleException>(() => QuotedOrder().SaveQuotationDraft(Draft(), Now.AddHours(2)));

    [Fact]
    public void Draft_SurvivesTheJsonColumn()
    {
        var draft = Draft();

        var back = DraftJson.Deserialize(DraftJson.Serialize(draft))!;

        Assert.Equal(draft.VehicleType, back.VehicleType);
        Assert.Equal(draft.Lines, back.Lines);
        Assert.Equal(draft with { Lines = back.Lines }, back);
        // Enums are stored by name; VehicleType's pinned JSON names (the web's values) apply here too.
        Assert.Contains("\"heavy-9\"", DraftJson.Serialize(draft));
        Assert.Contains("\"Load\"", DraftJson.Serialize(draft));
    }

    [Theory]
    [InlineData(nameof(VehicleType.Light5t), 96, 14400)]
    [InlineData(nameof(VehicleType.Heavy9t), 96, 20160)]
    [InlineData(nameof(VehicleType.Heavy14t), 116, 30160)]
    public void DistanceCharge_IsKmTimesTheRate(string vehicle, int km, decimal expected)
    {
        var line = Fares.DistanceLine(km, Enum.Parse<VehicleType>(vehicle));

        Assert.Equal(QuotationLineKind.Distance, line.Kind);
        Assert.Equal(expected, line.Amount);
        Assert.Equal(0, line.SortOrder);
        Assert.StartsWith($"{km} km × LKR ", line.Detail);
    }

    [Fact]
    public void DistanceCharge_FollowsTheConfiguredRates()
    {
        var options = new OrdersOptions();
        options.FareRates[VehicleType.Heavy9t] = 225;

        Assert.Equal(21600m, new FareCalculator(Options.Create(options)).DistanceLine(96, VehicleType.Heavy9t).Amount);
    }

    [Fact]
    public void SendValidator_AcceptsAFullQuotation()
    {
        var result = SendValidator().Validate(Send(lines: [new(QuotationLineKind.Load, "Load charge", "6.2 t", 4500)]));

        Assert.True(result.IsValid, string.Join("; ", result.Errors));
    }

    [Theory]
    [InlineData(-1, "ValidUntil")]
    [InlineData(31 * 24, "ValidUntil")]
    public void SendValidator_KeepsValidityBetweenNowAnd30Days(int hoursFromNow, string field)
    {
        var result = SendValidator().Validate(Send(validUntil: Now.AddHours(hoursFromNow)));

        Assert.Contains(result.Errors, e => e.PropertyName == field);
    }

    [Fact]
    public void SendValidator_RequiresTheDistance()
    {
        var result = SendValidator().Validate(Send(distanceKm: null));

        Assert.Contains(result.Errors, e => e.PropertyName == "DistanceKm");
    }

    [Fact]
    public void SendValidator_RefusesAHandPricedDistanceLine()
    {
        var result = SendValidator().Validate(Send(lines: [new(QuotationLineKind.Distance, "Distance charge", null, 1)]));

        Assert.Contains(result.Errors, e => e.PropertyName == "Lines[0].Kind");
    }

    [Fact]
    public void SendValidator_RefusesNegativeAmounts()
    {
        var result = SendValidator().Validate(Send(lines: [new(QuotationLineKind.Other, "Discount", null, -500)]));

        Assert.Contains(result.Errors, e => e.PropertyName == "Lines[0].Amount");
    }

    [Fact]
    public void DraftValidator_AcceptsUnfinishedWork() =>
        Assert.True(new SaveQuotationDraftRequestValidator()
            .Validate(new SaveQuotationDraftRequest(VehicleType.Light5t, null, null, null, null)).IsValid);

    [Fact]
    public void Email_ShowsEveryLineTheTotalTheLocalDeadlineAndTheLink()
    {
        var order = QuotedOrder();

        var email = QuotationEmails.Sent(order, order.CurrentQuotation!, "https://fleetsync.example/customer/quotations/ORD-1049");

        Assert.Equal("orders@lankatiles.lk", email.To);
        Assert.Equal("Fare quotation ready · ORD-1049", email.Subject);
        Assert.Contains("Dear Dilini Perera,", email.Body);
        Assert.Contains("Distance charge (96 km × LKR 210): LKR 20,160.00", email.Body);
        Assert.Contains("Total: LKR 27,660.00", email.Body);
        // Valid until 18 Nov 04:30 UTC is 10:00 in Colombo.
        Assert.Contains("Valid until 18 Nov 2026, 10:00 (Sri Lanka time).", email.Body);
        Assert.Contains("Includes unloading.", email.Body);
        Assert.Contains("https://fleetsync.example/customer/quotations/ORD-1049", email.Body);
    }

    private static SendQuotationRequestValidator SendValidator() => new(new FakeTimeProvider(Now));

    private static SendQuotationRequest Send(
        int? distanceKm = 96, DateTimeOffset? validUntil = null, IReadOnlyList<QuotationLineRequest>? lines = null) =>
        new(VehicleType.Heavy9t, distanceKm, lines, validUntil ?? Now.AddDays(1), null);
}
