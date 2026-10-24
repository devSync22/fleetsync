
using FleetSync.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI documentation
builder.Services.AddOpenApi();

// Basic application health checks
builder.Services.AddHealthChecks();

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

// Register Infrastructure services
builder.Services.AddInfrastructure(connectionString);

var app = builder.Build();

// OpenAPI is available during development
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Basic API health endpoint
app.MapHealthChecks("/health");

app.Run();
