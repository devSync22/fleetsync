namespace FleetSync.Modules.Orders.Application.Abstractions;

/// <summary>A plain-text email produced by the Orders module.</summary>
internal sealed record OrderEmail(string To, string Subject, string Body);

/// <summary>
/// Sends the Orders module's emails to customers. Development saves them as files (like the Auth module); a shared
/// sender or the Notifications module replaces this later (plan §6) without touching the use cases.
/// </summary>
internal interface IOrderEmailSender
{
    Task SendAsync(OrderEmail email, CancellationToken cancellationToken);
}
