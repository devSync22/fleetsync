using FleetSync.Modules.Auth.Application.Activation;
using FleetSync.Modules.Auth.Application.Passwords;
using FleetSync.Modules.Auth.Application.Sessions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>Staff account activation and password reset (both driven by emailed links).</summary>
internal static class AccountEndpoints
{
    public static void MapAccountEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/activation/lookup", LookupActivationAsync)
            .WithName("LookupActivation")
            .WithSummary("Approval details for the activation screen")
            .WithValidation<ActivationLookupRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/activation", ActivateAsync)
            .WithName("ActivateAccount")
            .WithSummary("Create the staff account's password")
            .WithValidation<ActivateAccountRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/forgot-password", ForgotPasswordAsync)
            .WithName("ForgotPassword")
            .WithSummary("Email a password reset link (always 202)")
            .WithValidation<ForgotPasswordRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/reset-password/lookup", LookupResetAsync)
            .WithName("LookupPasswordReset")
            .WithSummary("Check a reset link and get its account email")
            .WithValidation<ResetPasswordLookupRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/reset-password", ResetPasswordAsync)
            .WithName("ResetPassword")
            .WithSummary("Set a new password with the emailed token")
            .WithValidation<ResetPasswordRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        // Signed-in users only (any role); rate-limited because it checks a password.
        group.MapPost("/change-password", ChangePasswordAsync)
            .WithName("ChangePassword")
            .WithSummary("Change the signed-in user's password; signs out other devices")
            .WithValidation<ChangePasswordRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .RequireAuthorization();
    }

    /// <summary>
    /// Returns the new session for this device: browsers get the refresh token
    /// as the HttpOnly cookie, mobile clients (X-Client-Type: mobile) in the body.
    /// </summary>
    private static async Task<Results<Ok<AuthSessionResponse>, ProblemHttpResult>> ChangePasswordAsync(
        ChangePasswordRequest request,
        PasswordResetService passwords,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await passwords.ChangeAsync(context.User.GetUserId(), request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Ok(RefreshTokenTransport.Deliver(context, result.Value))
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<AccountApprovalResponse>, ProblemHttpResult>> LookupActivationAsync(
        ActivationLookupRequest request,
        AccountActivationService activation,
        CancellationToken cancellationToken)
    {
        var result = await activation.LookupAsync(request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> ActivateAsync(
        ActivateAccountRequest request,
        AccountActivationService activation,
        CancellationToken cancellationToken)
    {
        var result = await activation.ActivateAsync(request, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }

    private static async Task<Accepted> ForgotPasswordAsync(
        ForgotPasswordRequest request,
        PasswordResetService passwords,
        CancellationToken cancellationToken)
    {
        await passwords.RequestResetAsync(request, cancellationToken);
        return TypedResults.Accepted((string?)null);
    }

    private static async Task<Results<Ok<ResetPasswordLookupResponse>, ProblemHttpResult>> LookupResetAsync(
        ResetPasswordLookupRequest request,
        PasswordResetService passwords,
        CancellationToken cancellationToken)
    {
        var result = await passwords.LookupAsync(request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<NoContent, ProblemHttpResult>> ResetPasswordAsync(
        ResetPasswordRequest request,
        PasswordResetService passwords,
        CancellationToken cancellationToken)
    {
        var result = await passwords.ResetAsync(request, cancellationToken);
        return result.IsSuccess ? TypedResults.NoContent() : result.Error.ToProblem();
    }
}
