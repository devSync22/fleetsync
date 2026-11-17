using FleetSync.Modules.Auth.Application.Abstractions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Infrastructure.Email;

/// <summary>
/// Development email sender: saves each message as a text file in
/// <see cref="EmailOptions.PickupDirectory"/> instead of sending it, so links
/// (verify, reset, activate) can be opened from there.
///
/// The log only gets the recipient, subject and file name, never the body:
/// emails carry single-use tokens, and tokens must not appear in logs.
/// Replace with a real provider before production.
/// </summary>
internal sealed partial class PickupFolderEmailSender : IEmailSender
{
    private readonly string _directory;
    private readonly TimeProvider _clock;
    private readonly ILogger<PickupFolderEmailSender> _logger;

    public PickupFolderEmailSender(
        IOptions<AuthOptions> options,
        IHostEnvironment environment,
        TimeProvider clock,
        ILogger<PickupFolderEmailSender> logger)
    {
        _directory = Path.GetFullPath(Path.Combine(environment.ContentRootPath, options.Value.Email.PickupDirectory));
        _clock = clock;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(_directory);

        // Sortable by time; a random suffix keeps two emails in the same millisecond apart.
        // The recipient is not in the name, so the folder listing doesn't expose addresses.
        var fileName = $"{_clock.GetUtcNow():yyyyMMdd-HHmmss-fff}-{Guid.NewGuid():N}.txt";
        var content = $"To: {message.To}\nSubject: {message.Subject}\n\n{message.Body}\n";

        await File.WriteAllTextAsync(Path.Combine(_directory, fileName), content, cancellationToken);
        LogSaved(message.To, message.Subject, fileName);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Email to {To} | {Subject} | saved as {FileName}")]
    private partial void LogSaved(string to, string subject, string fileName);
}
