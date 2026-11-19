using Microsoft.AspNetCore.Http;

namespace FleetSync.Modules.Orders.Application.Common;

/// <summary>
/// An expected failure (unknown order, quotation already sent…), returned instead of thrown.
/// The endpoint layer turns it into an RFC 9457 ProblemDetails response whose <see cref="Code"/>
/// is sent as "errorCode" so the frontends can switch on it.
/// </summary>
internal sealed record OrderError(
    string Code,
    int StatusCode,
    string Title,
    string Detail,
    IReadOnlyDictionary<string, object?>? Extensions = null);

/// <summary>Catalogue of every error the Orders module can return.</summary>
internal static class OrderErrors
{
    /// <summary>The order doesn't exist, or the caller may not see it (another customer's order is also a 404).</summary>
    public static OrderError NotFound(string orderNumber) => new(
        "orders.not_found",
        StatusCodes.Status404NotFound,
        "Order not found",
        $"Order {orderNumber} was not found.");

    /// <summary>A quotation was already sent for this order; a new one must supersede it instead.</summary>
    public static OrderError AlreadyQuoted(string orderNumber) => new(
        "orders.already_quoted",
        StatusCodes.Status409Conflict,
        "Already quoted",
        $"{orderNumber} has already been quoted.");

    /// <summary>The order has no sent quotation to show yet.</summary>
    public static OrderError NoQuotation(string orderNumber) => new(
        "orders.no_quotation",
        StatusCodes.Status404NotFound,
        "No quotation yet",
        $"No quotation has been sent for {orderNumber} yet.");

    /// <summary>Someone else changed the order between loading and saving; reload and try again.</summary>
    public static OrderError ConcurrentChange(string orderNumber) => new(
        "orders.concurrent_change",
        StatusCodes.Status409Conflict,
        "The order changed",
        $"{orderNumber} was changed by someone else just now. Reload it and try again.");

    /// <summary>The order's current status doesn't allow this action.</summary>
    public static OrderError InvalidTransition(string orderNumber, string currentStatus, string action) => new(
        "orders.invalid_transition",
        StatusCodes.Status409Conflict,
        "Not allowed in the order's current status",
        $"{orderNumber} is {currentStatus}, so it can't be {action}.",
        new Dictionary<string, object?> { ["currentStatus"] = currentStatus });
}
