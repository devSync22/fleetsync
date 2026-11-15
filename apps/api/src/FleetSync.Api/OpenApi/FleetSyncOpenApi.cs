using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace FleetSync.Api.OpenApi;

/// <summary>
/// Customises the OpenAPI document that ASP.NET Core generates from the
/// endpoints (built-in Microsoft.AspNetCore.OpenApi). The document is served
/// at /openapi/v1.json and rendered by Scalar at /scalar in Development.
/// </summary>
internal static class FleetSyncOpenApi
{
    /// <summary>Name of the security scheme in the document; referenced by protected operations.</summary>
    private const string BearerScheme = "Bearer";

    public static void Configure(OpenApiOptions options)
    {
        options.AddDocumentTransformer(DescribeApi);
        options.AddOperationTransformer(RequireBearerWhereAuthorized);
    }

    /// <summary>
    /// Title/description shown at the top of the API reference, plus the
    /// "Bearer" (JWT) scheme so the UI can send an access token.
    /// </summary>
    private static Task DescribeApi(
        OpenApiDocument document,
        OpenApiDocumentTransformerContext context,
        CancellationToken cancellationToken)
    {
        document.Info = new OpenApiInfo
        {
            Title = "FleetSync API",
            Version = "v1",
            Description =
                "Backend API for the FleetSync web and mobile apps.\n\n" +
                "**Signing in:** call `POST /api/auth/login`, copy `accessToken` from the response " +
                "and paste it under *Authentication → Bearer*. Access tokens expire after 15 minutes.\n\n" +
                "**Refresh tokens:** browsers receive an HttpOnly cookie; mobile clients send " +
                "`X-Client-Type: mobile` on `/login`, `/refresh` and `/logout` and get the token in the body.\n\n" +
                "**Errors** are RFC 9457 ProblemDetails with a stable `code` field and a `traceId`.",
        };

        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes[BearerScheme] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Access token from POST /api/auth/login.",
        };

        return Task.CompletedTask;
    }

    /// <summary>
    /// Marks only endpoints that have [Authorize] / RequireAuthorization() as
    /// needing the Bearer token, so public endpoints (login, register...) stay
    /// shown as anonymous. [AllowAnonymous] wins over [Authorize], as at runtime.
    /// </summary>
    private static Task RequireBearerWhereAuthorized(
        OpenApiOperation operation,
        OpenApiOperationTransformerContext context,
        CancellationToken cancellationToken)
    {
        var metadata = context.Description.ActionDescriptor.EndpointMetadata;
        var requiresAuth = metadata.OfType<IAuthorizeData>().Any()
            && !metadata.OfType<IAllowAnonymous>().Any();

        if (requiresAuth)
        {
            operation.Security ??= [];
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(BearerScheme, context.Document)] = [],
            });
        }

        return Task.CompletedTask;
    }
}
