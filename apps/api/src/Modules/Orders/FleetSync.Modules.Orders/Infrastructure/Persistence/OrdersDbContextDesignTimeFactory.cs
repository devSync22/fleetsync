using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace FleetSync.Modules.Orders.Infrastructure.Persistence;

/// <summary>
/// Lets the dotnet-ef tools build <see cref="OrdersDbContext"/> without starting the API
/// (which would require every secret to be configured).
///
/// Commands that touch a real database (e.g. <c>database update</c>) read the connection string from
/// <c>ConnectionStrings__FleetSyncDatabase</c>; commands that only inspect the model
/// (<c>migrations add</c>, <c>has-pending-model-changes</c>) work with the placeholder below.
/// </summary>
internal sealed class OrdersDbContextDesignTimeFactory : IDesignTimeDbContextFactory<OrdersDbContext>
{
    public OrdersDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__FleetSyncDatabase")
            ?? "Host=127.0.0.1;Port=5432;Database=fleetsync_dev;Username=fleetsync";

        var options = new DbContextOptionsBuilder<OrdersDbContext>();
        OrdersDbContextOptions.Configure(options, connectionString);
        return new OrdersDbContext(options.Options);
    }
}
