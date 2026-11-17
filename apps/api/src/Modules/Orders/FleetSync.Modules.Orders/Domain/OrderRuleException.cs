namespace FleetSync.Modules.Orders.Domain;

/// <summary>
/// A domain method was called in a state that doesn't allow it. Use cases check the matching <c>Can…</c> property
/// first and return an error to the client, so reaching this exception means a bug, not bad user input.
/// </summary>
internal sealed class OrderRuleException(string orderNumber, OrderStatus status, string action)
    : InvalidOperationException($"{orderNumber} is {status}, so it can't be {action}.")
{
    public OrderStatus Status { get; } = status;

    public string Action { get; } = action;
}
