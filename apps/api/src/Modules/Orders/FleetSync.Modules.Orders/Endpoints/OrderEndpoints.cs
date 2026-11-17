using FleetSync.Modules.Orders.Application.Details;
using FleetSync.Modules.Orders.Application.Listing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace FleetSync.Modules.Orders.Endpoints;

/// <summary>The coordinator's order screens: Submitted orders and Review order / Order details.</summary>
internal static class OrderEndpoints
{
    public static void MapOrderEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", ListAsync)
            .WithName("ListOrders")
            .WithSummary("Submitted orders: one tab, filtered by search and pickup date, newest first, with tab counts")
            .WithValidation<OrderListQuery>();

        group.MapGet("/{orderNumber}", GetAsync)
            .WithName("GetOrder")
            .WithSummary("One order with its customer, route, cargo, current quotation and history");
    }

    private static async Task<Ok<OrderListResponse>> ListAsync(
        [AsParameters] OrderListQuery query,
        OrderListService orders,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await orders.ListAsync(query, cancellationToken));

    private static async Task<Results<Ok<OrderDetailResponse>, ProblemHttpResult>> GetAsync(
        string orderNumber,
        OrderDetailService orders,
        CancellationToken cancellationToken)
    {
        var result = await orders.GetAsync(orderNumber, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}
