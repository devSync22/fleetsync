using FleetSync.Modules.Auth.Application.Common;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Passwords;

/// <summary>Body of POST /api/auth/forgot-password.</summary>
internal sealed record ForgotPasswordRequest(string Email);

/// <summary>Body of POST /api/auth/reset-password/lookup: checks the link before showing the form.</summary>
internal sealed record ResetPasswordLookupRequest(string Token);

/// <summary>The account a reset link belongs to (shows "For &lt;email&gt;" on the page).</summary>
internal sealed record ResetPasswordLookupResponse(string Email);

/// <summary>Body of POST /api/auth/reset-password.</summary>
internal sealed record ResetPasswordRequest(string Token, string NewPassword);

/// <summary>
/// Body of POST /api/auth/change-password (signed-in user, "Change password" screens).
/// <see cref="RememberMe"/> sets the lifetime of the new session issued for this device.
/// </summary>
internal sealed record ChangePasswordRequest(string CurrentPassword, string NewPassword, bool RememberMe = false);

internal sealed class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator() => RuleFor(r => r.Email).Email();
}

internal sealed class ResetPasswordLookupRequestValidator : AbstractValidator<ResetPasswordLookupRequest>
{
    public ResetPasswordLookupRequestValidator() => RuleFor(r => r.Token).NotEmpty().MaximumLength(200);
}

internal sealed class ResetPasswordRequestValidator : AbstractValidator<ResetPasswordRequest>
{
    public ResetPasswordRequestValidator()
    {
        RuleFor(r => r.Token).NotEmpty().MaximumLength(200);
        RuleFor(r => r.NewPassword).Password();
    }
}

internal sealed class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        // Only presence for the current password: policy rules would leak hints about it.
        RuleFor(r => r.CurrentPassword)
            .NotEmpty().WithMessage("Enter your current password.")
            .MaximumLength(FieldRules.PasswordMaxLength);
        RuleFor(r => r.NewPassword).Password();
    }
}
