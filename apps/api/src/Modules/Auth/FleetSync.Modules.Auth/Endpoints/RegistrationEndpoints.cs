using FleetSync.Modules.Auth.Application.Registration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>Customer self-registration and email verification.</summary>
internal static class RegistrationEndpoints
{
    public static void MapRegistrationEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register/customer", RegisterCustomerAsync)
            .WithName("RegisterCustomer")
            .WithSummary("Create a customer company account (email verification required)")
            .WithValidation<RegisterCustomerRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit);

        group.MapPost("/verify-email", VerifyEmailAsync)
            .WithName("VerifyEmail")
            .WithSummary("Confirm an email address with the emailed token")
            .WithValidation<VerifyEmailRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit);

        group.MapPost("/verify-email/resend", ResendVerificationAsync)
            .WithName("ResendVerificationEmail")
            .WithSummary("Send a new verification link (always 202)")
            .WithValidation<ResendVerificationRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit);
    }

    private static async Task<Results<Created<RegistrationSubmittedResponse>, ProblemHttpResult>> RegisterCustomerAsync(
        RegisterCustomerRequest request,
        CustomerRegistrationService registration,
        CancellationToken cancellationToken)
    {
        var result = await registration.RegisterAsync(request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created((string?)null, result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> VerifyEmailAsync(
        VerifyEmailRequest request,
        CustomerRegistrationService registration,
        CancellationToken cancellationToken)
    {
        var result = await registration.VerifyEmailAsync(request, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }

    private static async Task<Accepted> ResendVerificationAsync(
        ResendVerificationRequest request,
        CustomerRegistrationService registration,
        CancellationToken cancellationToken)
    {
        await registration.ResendVerificationAsync(request, cancellationToken);
        return TypedResults.Accepted((string?)null);
    }
}
