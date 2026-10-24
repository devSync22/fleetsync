
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Infrastructure.Persistence;

public sealed class FleetSyncDbContext : DbContext
{
    public FleetSyncDbContext(
        DbContextOptions<FleetSyncDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(FleetSyncDbContext).Assembly);
    }
}
