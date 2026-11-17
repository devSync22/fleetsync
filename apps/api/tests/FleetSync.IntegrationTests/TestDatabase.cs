using Npgsql;

namespace FleetSync.IntegrationTests;

/// <summary>
/// Groups every test that touches PostgreSQL so they run one at a time
/// (migrations and shared data must not race).
/// </summary>
[CollectionDefinition(Name)]
public sealed class DatabaseCollection : ICollectionFixture<Auth.AuthApiFactory>
{
    public const string Name = "Database";
}

/// <summary>Reads and guards the test database connection string.</summary>
internal static class TestDatabase
{
    /// <summary>
    /// The connection string from <c>ConnectionStrings__FleetSyncDatabase</c>.
    /// Refuses anything other than the disposable test/CI databases so a test run
    /// can never migrate or write to a development or production database.
    /// </summary>
    public static string GetConnectionString()
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__FleetSyncDatabase");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "A test database connection string is required (ConnectionStrings__FleetSyncDatabase).");
        }

        var database = new NpgsqlConnectionStringBuilder(connectionString).Database;
        if (database is not ("fleetsync_test" or "fleetsync_ci"))
        {
            throw new InvalidOperationException("Integration tests must use an approved disposable test database.");
        }

        return connectionString;
    }
}
