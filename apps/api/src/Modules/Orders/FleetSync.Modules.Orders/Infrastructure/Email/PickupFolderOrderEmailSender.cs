using FleetSync.Modules.Orders.Application.Abstractions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Orders.Infrastructure.Email;

/// <summary>
/// Development email sender: saves each message as a text file in <see cref="OrdersOptions.EmailPickupDirectory"/>
/// (the same folder the Auth module uses) instead of sending it. The log gets the recipient and subject only.
/// Replace with a real provider before production.
/// </summary>
internal sealed partial class PickupFolderOrderEmailSender(
    IOptions<OrdersOptions> options,
    IHostEnvironment environment,
    TimeProvider clock,
    ILogger<PickupFolderOrderEmailSender> logger) : IOrderEmailSender
{
    private readonly string _directory =
        Path.GetFullPath(Path.Combine(environment.ContentRootPath, options.Value.EmailPickupDirectory));

    public async Task SendAsync(OrderEmail email, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_directory);

        // Sortable by time; the random suffix keeps two emails in the same millisecond apart.
        var fileName = $"{clock.GetUtcNow():yyyyMMdd-HHmmss-fff}-{Guid.NewGuid():N}.txt";
        var content = $"To: {email.To}\nSubject: {email.Subject}\n\n{email.Body}\n";

        await File.WriteAllTextAsync(Path.Combine(_directory, fileName), content, cancellationToken);
        LogSaved(email.To, email.Subject, fileName);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Email to {To} | {Subject} | saved as {FileName}")]
    private partial void LogSaved(string to, string subject, string fileName);
}
