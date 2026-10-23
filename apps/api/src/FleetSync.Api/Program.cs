
var builder = WebApplication.CreateBuilder(args);

// Register OpenAPI document generation.
builder.Services.AddOpenApi();

// Register built-in health checks.
builder.Services.AddHealthChecks();

var app = builder.Build();

// Expose OpenAPI only in the development environment.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Basic application health endpoint.
app.MapHealthChecks("/health");

app.Run();
