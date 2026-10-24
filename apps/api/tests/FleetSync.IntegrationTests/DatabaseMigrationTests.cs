
using FleetSync.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace FleetSync.IntegrationTests;

public sealed class DatabaseMigrationTests
{
    [Fact]
    public async Task InitialBaseline_CanBeAppliedToPostgreSql()
    {
        var connectionString =
            Environment.GetEnvironmentVariable(
                "ConnectionStrings__FleetSyncDatabase");

        Assert.False(
            string.IsNullOrWhiteSpace(connectionString),
            "A test database connection string is required.");

        // Guard against running migrations on a development,
        // staging, or production database by accident.
        var connection = new NpgsqlConnectionStringBuilder(
            connectionString);

        if (connection.Database is not
            ("fleetsync_test" or "fleetsync_ci"))
        {
            throw new InvalidOperationException(
                "Integration tests must use an approved " +
                "disposable test database.");
        }

        var options =
            new DbContextOptionsBuilder<FleetSyncDbContext>()
                .UseNpgsql(connectionString)
                .Options;

        await using var context =
            new FleetSyncDbContext(options);

        // 1. Verify actual PostgreSQL connectivity.
        Assert.True(
            await context.Database.CanConnectAsync());

        // 2. Apply the committed EF Core migrations.
        await context.Database.MigrateAsync();

        // 3. Confirm InitialBaseline was recorded.
        var appliedMigrations =
            await context.Database.GetAppliedMigrationsAsync();

        Assert.Contains(
            appliedMigrations,
            id => id.EndsWith(
                "_InitialBaseline",
                StringComparison.Ordinal));

        // 4. Ensure the database has no pending migrations.
        var pendingMigrations =
            await context.Database.GetPendingMigrationsAsync();

        Assert.Empty(pendingMigrations);

        // 5. Applying again should remain safe.
        await context.Database.MigrateAsync();

        Assert.Empty(
            await context.Database
                .GetPendingMigrationsAsync());
    }
}
