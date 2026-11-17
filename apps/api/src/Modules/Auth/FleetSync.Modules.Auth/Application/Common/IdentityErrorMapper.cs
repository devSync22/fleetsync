using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>Translates ASP.NET Core Identity failures into the module's error codes.</summary>
internal static class IdentityErrorMapper
{
    public static AuthError ToAuthError(IdentityResult result)
    {
        var errors = result.Errors.ToList();

        if (errors.Any(e => e.Code is nameof(IdentityErrorDescriber.DuplicateEmail)
                              or nameof(IdentityErrorDescriber.DuplicateUserName)))
        {
            return AuthErrors.EmailAlreadyRegistered;
        }

        // Identity's password rule codes all start with "Password" (PasswordTooShort, PasswordRequiresDigit…).
        var passwordErrors = errors.Where(e => e.Code.StartsWith("Password", StringComparison.Ordinal)).ToList();
        if (passwordErrors.Count > 0)
        {
            return AuthErrors.PasswordRejected(passwordErrors.Select(e => e.Description));
        }

        // Anything else (e.g. InvalidEmail) is reported as a generic validation problem.
        return new AuthError(
            "auth.account_rejected",
            StatusCodes.Status400BadRequest,
            "Account details not accepted",
            string.Join(" ", errors.Select(e => e.Description)));
    }
}
