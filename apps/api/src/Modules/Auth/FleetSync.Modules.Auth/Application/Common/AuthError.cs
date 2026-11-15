using Microsoft.AspNetCore.Http;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// An expected failure (wrong password, expired link…), returned instead of thrown.
/// The endpoint layer turns it into an RFC 9457 ProblemDetails response where
/// <see cref="Code"/> is a stable, machine-readable value (sent as "errorCode") the frontends can switch on.
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

    public static readonly AuthError AccountDisabled = new(
        "auth.account_disabled",
        StatusCodes.Status403Forbidden,
        "Account deactivated",
        "This account has been deactivated. Contact your Fleet Administrator.");

    /// <summary>Customer signed in with the right password, but the application isn't approved yet.</summary>
    public static readonly AuthError PendingApproval = new(
        "auth.pending_approval",
        StatusCodes.Status403Forbidden,
        "Waiting for approval",
        "Your registration is being reviewed. We'll email you once it's approved.");

    public static readonly AuthError ApplicationDuplicate = new(
        "application.duplicate",
        StatusCodes.Status409Conflict,
        "Application already submitted",
        "An application with this email or NIC is already being processed.");

    public static readonly AuthError ApplicationNotFound = new(
        "application.not_found",
        StatusCodes.Status404NotFound,
        "Application not found",
        "The application does not exist.");

    public static AuthError ApplicationNotPending(string status) => new(
        "application.not_pending",
        StatusCodes.Status409Conflict,
        "Application already reviewed",
        $"Only pending applications can be reviewed. This one is {status}.");

    /// <summary>A customer application can't be approved before the applicant verifies their email.</summary>
    public static readonly AuthError ApplicationEmailNotVerified = new(
        "application.email_not_verified",
        StatusCodes.Status409Conflict,
        "Email not verified yet",
        "The applicant hasn't confirmed their email address. Approve it once they have.");

    public static readonly AuthError LicenceTaken = new(
        "application.licence_taken",
        StatusCodes.Status409Conflict,
        "Licence already registered",
        "A driver with this licence number already exists.");

    public static readonly AuthError DocumentNotFound = new(
        "application.document_not_found",
        StatusCodes.Status404NotFound,
        "Document not found",
        "The document does not exist.");

    public static AuthError InvalidDocument(string fileName, string reason) => new(
        "application.invalid_document",
        StatusCodes.Status400BadRequest,
        "Document not accepted",
        $"{fileName}: {reason}");

    public static readonly AuthError UserNotFound = new(
        "user.not_found",
        StatusCodes.Status404NotFound,
        "User not found",
        "The account does not exist.");

    /// <summary>An administrator tried to deactivate their own account (they would lock themselves out).</summary>
    public static readonly AuthError CannotDeactivateSelf = new(
        "user.cannot_deactivate_self",
        StatusCodes.Status400BadRequest,
        "You can't deactivate your own account",
        "Ask another Fleet Administrator to do it.");

    public static readonly AuthError ProfileChangeDuplicate = new(
        "profile_change.duplicate",
        StatusCodes.Status409Conflict,
        "Change already requested",
        "You already have a pending request for this field. Wait for it to be reviewed.");

    public static readonly AuthError ProfileChangeNotFound = new(
        "profile_change.not_found",
        StatusCodes.Status404NotFound,
        "Request not found",
        "The profile change request does not exist.");

    public static AuthError ProfileChangeNotPending(string status) => new(
        "profile_change.not_pending",
        StatusCodes.Status409Conflict,
        "Request already reviewed",
        $"Only pending requests can be reviewed. This one is {status}.");

    /// <summary>Administrators can't approve or reject changes to their own account.</summary>
    public static readonly AuthError ProfileChangeSelfReview = new(
        "profile_change.self_review",
        StatusCodes.Status403Forbidden,
        "You can't review your own request",
        "Another Fleet Administrator must review changes to your account.");

    public static AuthError ProfileFieldNotAllowed(string field) => new(
        "profile_change.field_not_allowed",
        StatusCodes.Status400BadRequest,
        "This detail can't be changed",
        $"\"{field}\" doesn't apply to your account.");

    /// <summary>The new value is the same as the current one.</summary>
    public static readonly AuthError ProfileChangeNoChange = new(
        "profile_change.no_change",
        StatusCodes.Status400BadRequest,
        "Nothing to change",
        "The new value is the same as the current one.");
}
