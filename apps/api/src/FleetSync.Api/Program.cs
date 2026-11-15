
using System.Text.Json;
using System.Text.Json.Serialization;
using FleetSync.Api.OpenApi;
using FleetSync.Infrastructure;
using FleetSync.Infrastructure.Persistence;
using FleetSync.Modules.Auth;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI: the document is generated from the endpoints by the built-in
// Microsoft.AspNetCore.OpenApi; FleetSyncOpenApi adds the title and JWT scheme.
builder.Services.AddOpenApi(FleetSyncOpenApi.Configure);

// Read the database connection string
var connectionString =
    builder.Configuration.GetConnectionString(
        "FleetSyncDatabase");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Database connection string is missing. " +
        "Configure ConnectionStrings:FleetSyncDatabase.");
}

// Register EF Core and PostgreSQL
builder.Services.AddInfrastructure(connectionString);

// Modules (modular monolith): each module registers its own
// database context, services and endpoints.
builder.Services.AddAuthModule(builder.Configuration, connectionString);

// Errors are returned as RFC 9457 ProblemDetails with a trace id,
// so clients can show a message and support can find the log entry.
builder.Services.AddProblemDetails(options =>
    options.CustomizeProblemDetails = context =>
        context.ProblemDetails.Extensions.TryAdd(
            "traceId",
            context.HttpContext.TraceIdentifier));

// JSON conventions for the whole API: enums as kebab-case strings
// ("driver", "light-lorry"), matching the web and mobile types.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.KebabCaseLower)));

// CORS: only the configured frontends may call the API from a browser.
// AllowCredentials lets the web app send the HttpOnly refresh cookie.
var allowedOrigins =
    builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()));

// Register health checks
builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<FleetSyncDbContext>(
        name: "postgresql",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "ready" });

var app = builder.Build();

// Unhandled exceptions and bare error status codes become ProblemDetails.
app.UseExceptionHandler();
app.UseStatusCodePages();

// Development only: the raw OpenAPI document (/openapi/v1.json) and the
// interactive API reference rendered from it by Scalar (/scalar).
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options
        .WithTitle("FleetSync API")
        .AddPreferredSecuritySchemes("Bearer"));
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

// Keep the original endpoint as a liveness check
app.MapHealthChecks("/health", new HealthCheckOptions
{
    Predicate = _ => false
});

// Explicit liveness endpoint
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

// PostgreSQL readiness endpoint
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

// Module endpoints
app.MapAuthEndpoints();

app.Run();

/// <summary>
/// Exposes the generated Program class so integration tests can
/// start the API in memory with WebApplicationFactory.
/// </summary>
public partial class Program;
