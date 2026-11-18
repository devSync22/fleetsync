using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Domain;
using FluentValidation;

namespace FleetSync.Modules.Orders.Application.Quotations;

/// <summary>
/// A line the coordinator prices by hand (load, handling, special, tolls, other). The distance charge is never sent:
/// the API calculates it from <c>distanceKm</c> and the vehicle type's rate.
/// </summary>
internal sealed record QuotationLineRequest(QuotationLineKind Kind, string Label, string? Detail, decimal Amount);

/// <summary><c>PUT /api/orders/{orderNumber}/quotation/draft</c>: unfinished work, anything may be missing.</summary>
internal sealed record SaveQuotationDraftRequest(
    VehicleType VehicleType,
    int? DistanceKm,
    IReadOnlyList<QuotationLineRequest>? Lines,
    DateTimeOffset? ValidUntil,
    string? Message);

/// <summary><c>POST /api/orders/{orderNumber}/quotation/send</c>: everything the customer will see.</summary>
internal sealed record SendQuotationRequest(
    VehicleType VehicleType,
    int? DistanceKm,
    IReadOnlyList<QuotationLineRequest>? Lines,
    DateTimeOffset? ValidUntil,
    string? Message);

/// <summary>The draft as the Prepare quote form reloads it.</summary>
internal sealed record QuotationDraftResponse(
    VehicleType VehicleType,
    int? DistanceKm,
    IReadOnlyList<QuotationLineRequest> Lines,
    DateTimeOffset? ValidUntil,
    string? Message,
    DateTimeOffset SavedAt);

/// <summary>The "Quotation sent" / quotation details page: the order around the quotation, and the quotation itself.</summary>
internal sealed record QuotationDetailsResponse(
    string OrderNumber,
    OrderStatus OrderStatus,
    OrderPaymentStatus PaymentStatus,
    CustomerResponse Customer,
    string PickupCity,
    string DestinationCity,
    QuotationResponse Quotation);

/// <summary>One vehicle type and its LKR-per-km rate (<c>GET /api/orders/fare-rates</c>).</summary>
internal sealed record FareRateResponse(VehicleType VehicleType, decimal RatePerKm);

internal static class QuotationRules
{
    public const int MaxLines = 12;
    public const int MaxDistanceKm = 2000;
    public const decimal MaxLineAmount = 10_000_000;
    public const int MaxValidityDays = 30;
}

/// <summary>Rules every hand-priced line follows, in drafts and sent quotations alike.</summary>
internal sealed class QuotationLineValidator : AbstractValidator<QuotationLineRequest>
{
    public QuotationLineValidator()
    {
        RuleFor(l => l.Kind)
            .IsInEnum()
            .NotEqual(QuotationLineKind.Distance)
            .WithMessage("Don't send the distance charge: it is calculated from distanceKm.");
        RuleFor(l => l.Label).NotEmpty().MaximumLength(100);
        RuleFor(l => l.Detail).MaximumLength(200);
        RuleFor(l => l.Amount)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(QuotationRules.MaxLineAmount)
            .PrecisionScale(18, 2, ignoreTrailingZeros: true);
    }
}

internal sealed class SaveQuotationDraftRequestValidator : AbstractValidator<SaveQuotationDraftRequest>
{
    public SaveQuotationDraftRequestValidator()
    {
        RuleFor(r => r.VehicleType).IsInEnum();
        RuleFor(r => r.DistanceKm).InclusiveBetween(1, QuotationRules.MaxDistanceKm);
        RuleFor(r => r.Lines!.Count).LessThanOrEqualTo(QuotationRules.MaxLines).When(r => r.Lines is not null)
            .OverridePropertyName(nameof(SaveQuotationDraftRequest.Lines));
        RuleForEach(r => r.Lines).SetValidator(new QuotationLineValidator());
        RuleFor(r => r.Message).MaximumLength(1000);
    }
}

internal sealed class SendQuotationRequestValidator : AbstractValidator<SendQuotationRequest>
{
    public SendQuotationRequestValidator(TimeProvider clock)
    {
        RuleFor(r => r.VehicleType).IsInEnum();
        RuleFor(r => r.DistanceKm)
            .NotNull().WithMessage("Enter the distance in km.")
            .InclusiveBetween(1, QuotationRules.MaxDistanceKm);
        RuleFor(r => r.Lines!.Count).LessThanOrEqualTo(QuotationRules.MaxLines).When(r => r.Lines is not null)
            .OverridePropertyName(nameof(SendQuotationRequest.Lines));
        RuleForEach(r => r.Lines).SetValidator(new QuotationLineValidator());
        RuleFor(r => r.ValidUntil)
            .NotNull().WithMessage("Choose until when the quotation is valid.")
            .Must(v => v > clock.GetUtcNow()).WithMessage("The quotation must be valid until a time in the future.")
            .Must(v => v <= clock.GetUtcNow().AddDays(QuotationRules.MaxValidityDays))
            .WithMessage($"A quotation can be valid for at most {QuotationRules.MaxValidityDays} days.");
        RuleFor(r => r.Message).MaximumLength(1000);
    }
}
