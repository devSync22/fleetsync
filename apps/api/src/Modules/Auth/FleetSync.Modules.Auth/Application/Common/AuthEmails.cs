using FleetSync.Modules.Auth.Application.Abstractions;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Builds the text of every email the Auth module sends, and the links in them.
/// Keeping templates in one place makes wording and URLs easy to review.
/// </summary>
internal sealed class AuthEmails(IOptions<AuthOptions> options)
{
    private LinkOptions Links => options.Value.Links;

    private TokenLifetimeOptions Lifetimes => options.Value.Tokens;

    public EmailMessage VerifyEmail(string to, string firstName, string reference, string token) => new(
        to,
        "Verify your FleetSync email",
        $"""
        Hi {firstName},

        Thanks for registering with FleetSync (reference {reference}).
        Confirm your email address to activate your account:

        {WebLink("verify-email", token)}

        This link expires in {Lifetimes.EmailVerificationHours} hours. If you didn't register, ignore this email.
        """);

    public EmailMessage ResetPassword(string to, string firstName, string token) => new(
        to,
        "Reset your FleetSync password",
        $"""
        Hi {firstName},

        We received a request to reset your FleetSync password. Choose a new one here:

        {WebLink("reset-password", token)}

        This link expires in {Lifetimes.PasswordResetMinutes} minutes. If you didn't ask for this, you can ignore this email.
        """);

    public EmailMessage StaffApplicationReceived(string to, string firstName, string reference) => new(
        to,
        "We received your FleetSync staff application",
        $"""
        Hi {firstName},

        Your application ({reference}) has been received. A Fleet Administrator will review it
        and you'll get another email with the decision.
        """);

    public EmailMessage StaffApplicationApproved(string to, string firstName, string token) => new(
        to,
        "Your FleetSync account was approved",
        $"""
        Hi {firstName},

        Good news: your staff account was approved. Create your password to start using FleetSync:

        {AppendToken(Links.ActivationUrl, token)}

        This link expires in {Lifetimes.StaffActivationDays} days.
        """);

    public EmailMessage StaffApplicationRejected(string to, string firstName, string reference, string reason) => new(
        to,
        "Update on your FleetSync staff application",
        $"""
        Hi {firstName},

        Unfortunately your application ({reference}) was not approved.

        Reason: {reason}

        Contact your Fleet Administrator if you have questions.
        """);

    private string WebLink(string path, string token) =>
        AppendToken($"{Links.WebAppBaseUrl.TrimEnd('/')}/{path}", token);

    // Tokens are URL-safe base64, but escape anyway in case the format changes.
    private static string AppendToken(string url, string token) =>
        $"{url}{(url.Contains('?') ? '&' : '?')}token={Uri.EscapeDataString(token)}";
}
