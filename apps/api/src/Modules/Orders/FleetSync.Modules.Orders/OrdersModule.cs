using FleetSync.Application.Security;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace FleetSync.Modules.Orders;

/// <summary>
/// The Orders module's public surface. The host calls exactly two methods:
/// <see cref="AddOrdersModule"/> while building services and
/// <see cref="MapOrdersEndpoints"/> after building the app. Everything else is internal.
/// </summary>
public static class OrdersModule
{
    /// <summary>Route prefix for the coordinator's order endpoints.</summary>
    public const string RoutePrefix = "/api/orders";

    /// <summary>Registers the module: database, validators and services.</summary>
    public static IServiceCollection AddOrdersModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddDbContext<OrdersDbContext>(options => OrdersDbContextOptions.Configure(options, connectionString));

        // Readiness probe: /health/ready reports unhealthy if the orders tables can't be reached.
        services.AddHealthChecks()
            .AddDbContextCheck<OrdersDbContext>("orders-database", HealthStatus.Unhealthy, ["ready"]);

        services.AddValidatorsFromAssembly(typeof(OrdersModule).Assembly, includeInternalTypes: true);

        services.TryAddSingleton(TimeProvider.System);

        return services;
    }

    /// <summary>
    /// Maps every coordinator order endpoint under <see cref="RoutePrefix"/>.
    /// The whole group is for Operational Coordinators (<see cref="FleetSyncPolicies.RequireOperations"/>).
    /// </summary>
    public static IEndpointRouteBuilder MapOrdersEndpoints(this IEndpointRouteBuilder endpoints)
    {
        // Endpoints are added to this group per use case in the next slices (plan §9).
        endpoints.MapGroup(RoutePrefix)
            .WithTags("Orders")
            .RequireAuthorization(FleetSyncPolicies.RequireOperations);

        return endpoints;
    }
}
