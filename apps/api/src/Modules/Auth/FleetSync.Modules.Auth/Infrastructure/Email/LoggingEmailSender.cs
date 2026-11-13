using FleetSync.Modules.Auth.Application.Abstractions;
using Microsoft.Extensions.Logging;

namespace FleetSync.Modules.Auth.Infrastructure.Email;

/// <summary>
/// Development email sender: writes each message to the application log
/// instead of sending it, so links (verify, reset, activate) can be copied
/// from the console. Replace with a real provider before production, because
/// the log then contains live single-use links.
/// </summary>
internal sealed partial class LoggingEmailSender(ILogger<LoggingEmailSender> logger) : IEmailSender
{
    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        LogEmail(message.To, message.Subject, message.Body);
        return Task.CompletedTask;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Email to {To} | {Subject}\n{Body}")]
    private partial void LogEmail(string to, string subject, string body);
}
