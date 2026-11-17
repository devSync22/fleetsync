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

    /// <summary>The order's current status doesn't allow this action.</summary>
    public static OrderError InvalidTransition(string orderNumber, string currentStatus, string action) => new(
        "orders.invalid_transition",
        StatusCodes.Status409Conflict,
        "Not allowed in the order's current status",
        $"{orderNumber} is {currentStatus}, so it can't be {action}.",
        new Dictionary<string, object?> { ["currentStatus"] = currentStatus });
}
