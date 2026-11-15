using System.Security.Claims;
using System.Text.Json;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Sessions;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>Names of the module's authorization and rate-limit policies.</summary>
internal static class AuthPolicies
{
    /// <summary>
    /// Account management (DI-01, DI-02): reviewing applications and profile
    /// changes, deactivating accounts. Fleet Administrators only; the EER's
    /// reviewed_by and approved_by columns reference FLEET_ADMINISTRATOR.
    /// </summary>
    public const string FleetAdministrator = "RequireFleetAdministrator";

    /// <summary>
    /// Reading the audit trail: Fleet Administrators, plus the Fleet Owner, who
    /// is read-only everywhere. Only ever used on GET endpoints.
    /// </summary>
    public const string AuditTrailReader = "RequireAuditTrailReader";

    /// <summary>Per-IP limit for anonymous endpoints (sign-in, registration, emails).</summary>
    public const string PublicRateLimit = "auth:public";
}

internal static class EndpointHelpers
{
    /// <summary>
    /// Converts an <see cref="AuthError"/> to an RFC 9457 problem response with a
    /// stable "errorCode" the frontends can switch on (e.g. "auth.locked_out").
    /// </summary>
    public static ProblemHttpResult ToProblem(this AuthError error)
    {
        var extensions = new Dictionary<string, object?> { ["errorCode"] = error.Code };
        foreach (var (key, value) in error.Extensions ?? new Dictionary<string, object?>())
        {
            extensions[key] = value;
        }

        return TypedResults.Problem(
            detail: error.Detail,
            statusCode: error.StatusCode,
            title: error.Title,
            extensions: extensions);
    }

    /// <summary>Runs the FluentValidation validator for <typeparamref name="T"/> before the handler.</summary>
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter<ValidationFilter<T>>().ProducesValidationProblem();

    /// <summary>Validates a value inside a handler (for inputs that aren't a single bound argument).</summary>
    public static async Task<ValidationProblem?> ValidateAsync<T>(
        this IServiceProvider services, T value, CancellationToken cancellationToken)
    {
        var validator = services.GetRequiredService<IValidator<T>>();
        var result = await validator.ValidateAsync(value, cancellationToken);
        return result.IsValid ? null : ToValidationProblem(result);
    }

    /// <summary>The signed-in user's id (the JWT "sub" claim).</summary>
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue(AuthClaimTypes.UserId)
                   ?? throw new InvalidOperationException("The access token has no subject claim."));

    internal static ValidationProblem ToValidationProblem(FluentValidation.Results.ValidationResult result)
    {
        // camelCase keys so they match the JSON field names the clients sent.
        var errors = result.Errors
            .GroupBy(e => JsonNamingPolicy.CamelCase.ConvertName(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

        return TypedResults.ValidationProblem(
            errors,
            title: "Some fields need attention",
            extensions: new Dictionary<string, object?> { ["errorCode"] = "validation_failed" });
    }
}

/// <summary>Endpoint filter: returns 400 with field errors when the argument is invalid.</summary>
internal sealed class ValidationFilter<T> : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
        {
            return await next(context);
        }

        // Resolved per request: validators are scoped and may depend on scoped services.
        var validator = context.HttpContext.RequestServices.GetRequiredService<IValidator<T>>();
        var result = await validator.ValidateAsync(argument, context.HttpContext.RequestAborted);
        return result.IsValid ? await next(context) : EndpointHelpers.ToValidationProblem(result);
    }
}

/// <summary>
/// Decides how the refresh token travels:
/// mobile apps (header <c>X-Client-Type: mobile</c>) get it in the JSON body and
/// keep it in secure storage; browsers get an HttpOnly cookie that scripts
/// cannot read, which protects it from XSS.
/// </summary>
internal static class RefreshTokenTransport
{
    public const string CookieName = "fleetsync_refresh";
    public const string ClientTypeHeader = "X-Client-Type";

    // The cookie is only sent to auth endpoints, nowhere else on the API.
    private const string CookiePath = "/api/auth";

    public static bool IsMobileClient(HttpRequest request) =>
        string.Equals(request.Headers[ClientTypeHeader], "mobile", StringComparison.OrdinalIgnoreCase);

    /// <summary>Builds the response body and, for browsers, sets the refresh cookie.</summary>
    public static AuthSessionResponse Deliver(HttpContext context, IssuedSession session)
    {
        string? bodyToken = null;

        if (IsMobileClient(context.Request))
        {
            bodyToken = session.RefreshToken;
        }
        else
        {
            context.Response.Cookies.Append(CookieName, session.RefreshToken, new CookieOptions
            {
                HttpOnly = true,
                // Browsers treat http://localhost as secure, so this also works in development.
                Secure = true,
                // Never sent on cross-site requests, which blocks CSRF against refresh/logout.
                SameSite = SameSiteMode.Strict,
                Path = CookiePath,
                // "Remember me" → persistent cookie; otherwise it ends with the browser session.
                Expires = session.IsPersistent ? session.RefreshTokenExpiresAt : null,
                IsEssential = true,
            });
        }

        return new AuthSessionResponse(
            session.AccessToken.Token,
            "Bearer",
            session.AccessToken.ExpiresAt,
            bodyToken,
            session.RefreshTokenExpiresAt,
            session.User);
    }

    /// <summary>The refresh token from the body (mobile) or the cookie (web).</summary>
    public static string? Read(HttpContext context, RefreshRequest? body) =>
        !string.IsNullOrWhiteSpace(body?.RefreshToken) ? body.RefreshToken : context.Request.Cookies[CookieName];

    public static void Clear(HttpContext context) =>
        context.Response.Cookies.Delete(CookieName, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = CookiePath,
        });
}
