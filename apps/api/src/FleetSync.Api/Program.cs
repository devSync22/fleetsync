
using FleetSync.Infrastructure;
using FleetSync.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI
builder.Services.AddOpenApi();

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

// Register health checks
builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<FleetSyncDbContext>(
        name: "postgresql",
        failureStatus: HealthStatus.Unhealthy,
        tags: new[] { "ready" });

var app = builder.Build();

// Development OpenAPI endpoint
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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

app.Run();
