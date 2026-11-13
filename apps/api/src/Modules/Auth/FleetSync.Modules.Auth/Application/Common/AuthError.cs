using Microsoft.AspNetCore.Http;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// An expected failure (wrong password, expired link…), returned instead of thrown.
/// The endpoint layer turns it into an RFC 9457 ProblemDetails response where
/// <see cref="Code"/> is a stable, machine-readable value the frontends can switch on.
/// </summary>
internal sealed record AuthError(
    string Code,
    int StatusCode,
    string Title,
    string Detail,
    IReadOnlyDictionary<string, object?>? Extensions = null);

/// <summary>Catalogue of every error the Auth module can return.</summary>
internal static class AuthErrors
{
    /// <summary>
    /// Wrong email or password. Deliberately does not say which was wrong.
    /// <paramref name="attemptsLeft"/> feeds the "2 attempts left" helper text.
    /// </summary>
    public static AuthError InvalidCredentials(int? attemptsLeft) => new(
        "auth.invalid_credentials",
        StatusCodes.Status401Unauthorized,
        "Incorrect email or password",
        "Check your details and try again.",
        attemptsLeft is null ? null : new Dictionary<string, object?> { ["attemptsLeft"] = attemptsLeft });

    public static AuthError LockedOut(DateTimeOffset lockoutEnd) => new(
        "auth.locked_out",
        StatusCodes.Status423Locked,
        "Account temporarily locked",
        "Too many failed sign-in attempts. Try again later or reset your password.",
        new Dictionary<string, object?> { ["lockoutEnd"] = lockoutEnd });

    public static readonly AuthError EmailNotVerified = new(
        "auth.email_not_verified",
        StatusCodes.Status403Forbidden,
        "Email not verified",
        "Open the verification link we emailed you before signing in.");

    public static readonly AuthError EmailAlreadyRegistered = new(
        "auth.email_taken",
        StatusCodes.Status409Conflict,
        "Email already in use",
        "An account with this email already exists. Sign in or reset your password.");

    public static readonly AuthError InvalidRefreshToken = new(
        "auth.invalid_refresh_token",
        StatusCodes.Status401Unauthorized,
        "Session expired",
        "Your session has ended. Please sign in again.");

    public static readonly AuthError InvalidOrExpiredLink = new(
        "auth.invalid_token",
        StatusCodes.Status400BadRequest,
        "Link invalid or expired",
        "This link has expired or was already used. Request a new one.");

    public static readonly AuthError PasswordReused = new(
        "auth.password_reused",
        StatusCodes.Status400BadRequest,
        "Choose a new password",
        "Your new password must be different from your previous passwords.");

    /// <summary>Identity rejected the password (policy rules); the messages are listed per rule.</summary>
    public static AuthError PasswordRejected(IEnumerable<string> reasons) => new(
        "auth.password_rejected",
        StatusCodes.Status400BadRequest,
        "Password does not meet the requirements",
        "Choose a stronger password.",
        new Dictionary<string, object?> { ["errors"] = new Dictionary<string, string[]> { ["password"] = reasons.ToArray() } });

    public static readonly AuthError StaffApplicationDuplicate = new(
        "staff_application.duplicate",
        StatusCodes.Status409Conflict,
        "Application already submitted",
        "An application with this email or NIC is already being processed.");

    public static readonly AuthError StaffApplicationNotFound = new(
        "staff_application.not_found",
        StatusCodes.Status404NotFound,
        "Application not found",
        "The staff application does not exist.");

    public static AuthError StaffApplicationNotPending(string status) => new(
        "staff_application.not_pending",
        StatusCodes.Status409Conflict,
        "Application already reviewed",
        $"Only pending applications can be reviewed. This one is {status}.");

    public static readonly AuthError DocumentNotFound = new(
        "staff_application.document_not_found",
        StatusCodes.Status404NotFound,
        "Document not found",
        "The document does not exist.");

    public static AuthError InvalidDocument(string fileName, string reason) => new(
        "staff_application.invalid_document",
        StatusCodes.Status400BadRequest,
        "Document not accepted",
        $"{fileName}: {reason}");
}
