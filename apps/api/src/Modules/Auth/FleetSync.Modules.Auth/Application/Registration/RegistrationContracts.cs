using FleetSync.Modules.Auth.Application.Common;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Registration;

/// <summary>Body of POST /api/auth/register/customer (matches the web <c>CustomerRegistrationRequest</c>).</summary>
internal sealed record RegisterCustomerRequest(
    string CompanyName,
    string BusinessRegistrationNo,
    string BillingAddress,
    string FullName,
    string Mobile,
    string Email,
    string Password);

/// <summary>Body of POST /api/auth/verify-email: the token from the emailed link.</summary>
internal sealed record VerifyEmailRequest(string Token);

/// <summary>Body of POST /api/auth/verify-email/resend.</summary>
internal sealed record ResendVerificationRequest(string Email);

/// <summary>
/// Returned after a customer registration or staff application; fills the
/// "Registration submitted" screen (reference number, email, time).
/// </summary>
internal sealed record RegistrationSubmittedResponse(string Reference, string Email, DateTimeOffset SubmittedAt);

internal sealed class RegisterCustomerRequestValidator : AbstractValidator<RegisterCustomerRequest>
{
    public RegisterCustomerRequestValidator()
    {
        RuleFor(r => r.CompanyName)
            .NotEmpty().WithMessage("Enter the company name.")
            .MaximumLength(200);

        RuleFor(r => r.BusinessRegistrationNo)
            .NotEmpty().WithMessage("Enter the business registration number.")
            .MaximumLength(50);

        RuleFor(r => r.BillingAddress)
            .NotEmpty().WithMessage("Enter the billing address.")
            .MaximumLength(500);

        RuleFor(r => r.FullName).PersonName();
        RuleFor(r => r.Mobile).SriLankanMobile();
        RuleFor(r => r.Email).Email();
        RuleFor(r => r.Password).Password();
    }
}

internal sealed class VerifyEmailRequestValidator : AbstractValidator<VerifyEmailRequest>
{
    public VerifyEmailRequestValidator() =>
        RuleFor(r => r.Token).NotEmpty().MaximumLength(200);
}

internal sealed class ResendVerificationRequestValidator : AbstractValidator<ResendVerificationRequest>
{
    public ResendVerificationRequestValidator() =>
        RuleFor(r => r.Email).Email();
}
