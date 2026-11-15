using FleetSync.Modules.Auth.Application.Sessions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System.Security.Claims;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>Sign-in, refresh, sign-out and "who am I".</summary>
internal static class SessionEndpoints
{
    public static void MapSessionEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/login", LoginAsync)
            .WithName("Login")
            .WithSummary("Sign in with email and password")
            .WithValidation<LoginRequest>()
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/refresh", RefreshAsync)
            .WithName("RefreshSession")
            .WithSummary("Exchange a refresh token for a new access token")
            .RequireRateLimiting(AuthPolicies.PublicRateLimit)
            .AllowAnonymous();

        group.MapPost("/logout", LogoutAsync)
            .WithName("Logout")
            .WithSummary("End the current session")
            // Works with an expired access token: only the refresh token matters.
            .AllowAnonymous();

        group.MapGet("/me", GetCurrentUserAsync)
            .WithName("GetCurrentUser")
            .WithSummary("The signed-in user")
            .RequireAuthorization();
    }

    private static async Task<Results<Ok<AuthSessionResponse>, ProblemHttpResult>> LoginAsync(
        LoginRequest request,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await sessions.LoginAsync(request, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Ok(RefreshTokenTransport.Deliver(context, result.Value))
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<AuthSessionResponse>, ProblemHttpResult>> RefreshAsync(
        // Optional body: the web app sends nothing and relies on the cookie.
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshRequest? request,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var result = await sessions.RefreshAsync(RefreshTokenTransport.Read(context, request), cancellationToken);
        if (!result.IsSuccess)
        {
            RefreshTokenTransport.Clear(context);
            return result.Error.ToProblem();
        }

        return TypedResults.Ok(RefreshTokenTransport.Deliver(context, result.Value));
    }

    private static async Task<NoContent> LogoutAsync(
        [FromBody(EmptyBodyBehavior = Microsoft.AspNetCore.Mvc.ModelBinding.EmptyBodyBehavior.Allow)] RefreshRequest? request,
        SessionService sessions,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        await sessions.LogoutAsync(RefreshTokenTransport.Read(context, request), cancellationToken);
        RefreshTokenTransport.Clear(context);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<AuthUserResponse>, UnauthorizedHttpResult>> GetCurrentUserAsync(
        ClaimsPrincipal principal,
        SessionService sessions)
    {
        var user = await sessions.GetUserAsync(principal.GetUserId());
        return user is null ? TypedResults.Unauthorized() : TypedResults.Ok(user);
    }
}
