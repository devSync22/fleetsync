using System.Security.Claims;
using System.Text.Json;
using FleetSync.Modules.Orders.Application.Common;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.Modules.Orders.Endpoints;

internal static class EndpointHelpers
{
    /// <summary>
    /// Converts an <see cref="OrderError"/> to an RFC 9457 problem response with a
    /// stable "errorCode" the frontends can switch on (e.g. "orders.already_quoted").
    /// </summary>
    public static ProblemHttpResult ToProblem(this OrderError error)
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

    /// <summary>The signed-in user's id: the access token's "sub" claim (the Auth module keeps short claim names).</summary>
    public static Guid GetUserId(this ClaimsPrincipal user) =>
        Guid.Parse(user.FindFirstValue("sub")
                   ?? throw new InvalidOperationException("The access token has no subject claim."));

    /// <summary>Runs the FluentValidation validator for <typeparamref name="T"/> before the handler.</summary>
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter<ValidationFilter<T>>().ProducesValidationProblem();

    internal static ValidationProblem ToValidationProblem(FluentValidation.Results.ValidationResult result)
    {
        // camelCase keys so they match the JSON field names the clients sent.
        var errors = result.Errors
            .GroupBy(e => JsonNamingPolicy.CamelCase.ConvertName(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

        // Same code and title as the Auth module, so the web handles every module's 400 the same way.
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
