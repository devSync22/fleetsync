using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence;

/// <summary>
/// Lets the dotnet-ef tools build <see cref="AuthDbContext"/> without starting the API
/// (which would require every secret to be configured).
///
/// Commands that touch a real database (e.g. <c>database update</c>) read the
/// connection string from <c>ConnectionStrings__FleetSyncDatabase</c>; commands that
/// only inspect the model (<c>migrations add</c>, <c>has-pending-model-changes</c>)
/// work with the placeholder below.
/// </summary>
internal sealed class AuthDbContextDesignTimeFactory : IDesignTimeDbContextFactory<AuthDbContext>
{
    public AuthDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__FleetSyncDatabase")
            ?? "Host=127.0.0.1;Port=5432;Database=fleetsync_dev;Username=fleetsync";

        var options = new DbContextOptionsBuilder<AuthDbContext>();
        AuthDbContextOptions.Configure(options, connectionString);

        // The clock only stamps UpdatedAt on save, which the ef tools never do.
        return new AuthDbContext(options.Options, TimeProvider.System);
    }
}

/// <summary>Npgsql settings shared by runtime and design-time registration.</summary>
internal static class AuthDbContextOptions
{
    public static void Configure(DbContextOptionsBuilder options, string connectionString) =>
        options.UseNpgsql(
            connectionString,
            npgsql => npgsql.MigrationsHistoryTable("__EFMigrationsHistory", AuthDbContext.Schema));
}
