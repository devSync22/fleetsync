using System.Security.Claims;
using FleetSync.Modules.Orders.Application.Quotations;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace FleetSync.Modules.Orders.Endpoints;

/// <summary>Review order → Prepare quote (draft, send) and the Quotation sent / details page.</summary>
internal static class QuotationEndpoints
{
    public static void MapQuotationEndpoints(this RouteGroupBuilder group)
    {
        // A literal segment, so it wins over /{orderNumber}.
        group.MapGet("/fare-rates", GetFareRates)
            .WithName("GetFareRates")
            .WithSummary("LKR per km for each vehicle type; the distance charge is km × this rate");

        var quotation = group.MapGroup("/{orderNumber}/quotation");

        quotation.MapGet("/", GetAsync)
            .WithName("GetQuotation")
            .WithSummary("The order's current quotation and the customer's response so far");

        quotation.MapPut("/draft", SaveDraftAsync)
            .WithName("SaveQuotationDraft")
            .WithSummary("Save unfinished work on the quotation (Save draft); only while the order is pending review")
            .WithValidation<SaveQuotationDraftRequest>();

        quotation.MapPost("/send", SendAsync)
            .WithName("SendQuotation")
            .WithSummary("Send the quotation: the distance charge is calculated, the order becomes Quoted and the customer is emailed")
            .WithValidation<SendQuotationRequest>();
    }

    private static Ok<IReadOnlyList<FareRateResponse>> GetFareRates(QuotationService quotations) =>
        TypedResults.Ok(quotations.GetFareRates());

    private static async Task<Results<Ok<QuotationDetailsResponse>, ProblemHttpResult>> GetAsync(
        string orderNumber, QuotationService quotations, CancellationToken cancellationToken)
    {
        var result = await quotations.GetAsync(orderNumber, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<QuotationDraftResponse>, ProblemHttpResult>> SaveDraftAsync(
        string orderNumber,
        SaveQuotationDraftRequest request,
        ClaimsPrincipal user,
        QuotationService quotations,
        CancellationToken cancellationToken)
    {
        var result = await quotations.SaveDraftAsync(orderNumber, request, user.GetUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Created<QuotationDetailsResponse>, ProblemHttpResult>> SendAsync(
        string orderNumber,
        SendQuotationRequest request,
        ClaimsPrincipal user,
        QuotationService quotations,
        CancellationToken cancellationToken)
    {
        var result = await quotations.SendAsync(orderNumber, request, user.GetUserId(), cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created($"{OrdersModule.RoutePrefix}/{result.Value.OrderNumber}/quotation", result.Value)
            : result.Error.ToProblem();
    }
}
