namespace FleetSync.Modules.Auth.Application.Abstractions;

/// <summary>A plain-text email produced by the Auth module.</summary>
internal sealed record EmailMessage(string To, string Subject, string Body);

/// <summary>
/// Sends transactional emails (verify email, reset password, application decisions).
/// Development uses a logging implementation; a real provider (SMTP, SES…) can be
/// plugged in later without touching the auth flows.
/// </summary>
internal interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
}
