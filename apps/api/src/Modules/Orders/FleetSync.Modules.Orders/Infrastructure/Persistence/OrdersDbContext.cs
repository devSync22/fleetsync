using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Orders.Infrastructure.Persistence;

/// <summary>
/// The Orders module's database context. Everything lives in the PostgreSQL "orders" schema with its own
/// migrations history table, so no other module can depend on these tables directly (ADR-0002).
/// </summary>
internal sealed class OrdersDbContext(DbContextOptions<OrdersDbContext> options) : DbContext(options)
{
    /// <summary>PostgreSQL schema owned by this module (not one of the schemas Supabase reserves).</summary>
    public const string Schema = "orders";

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.HasDefaultSchema(Schema);
        builder.ApplyConfigurationsFromAssembly(typeof(OrdersDbContext).Assembly);
    }

    /// <summary>Conventions for every Orders entity; a configuration can still override one property.</summary>
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Statuses and types are stored as their names, not numbers (DI-14).
        configurationBuilder.Properties<Enum>().HaveConversion<string>().HaveMaxLength(30);

        // Money is LKR with two decimals (DI-27).
        configurationBuilder.Properties<decimal>().HavePrecision(18, 2);
    }
}

/// <summary>Npgsql settings shared by runtime and design-time registration.</summary>
internal static class OrdersDbContextOptions
{
    public static void Configure(DbContextOptionsBuilder options, string connectionString) =>
        options.UseNpgsql(
            connectionString,
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", OrdersDbContext.Schema));
}
