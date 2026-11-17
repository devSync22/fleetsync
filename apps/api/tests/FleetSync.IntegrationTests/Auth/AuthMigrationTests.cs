using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>The Auth module's migrations apply cleanly and seed the roles.</summary>
[Collection(DatabaseCollection.Name)]
public sealed class AuthMigrationTests(AuthApiFactory factory)
{
    [Fact]
    public async Task Auth_migrations_are_applied_and_roles_are_seeded()
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

        Assert.Empty(await db.Database.GetPendingMigrationsAsync());
        Assert.Contains(await db.Database.GetAppliedMigrationsAsync(), id => id.EndsWith("_AddAuthModule", StringComparison.Ordinal));

        var roles = await db.Roles.Select(r => r.Name).ToListAsync();
        Assert.Equal(AuthRoles.All.Order(), roles.Order());

        // Applying again is a no-op.
        await db.Database.MigrateAsync();
    }
}
