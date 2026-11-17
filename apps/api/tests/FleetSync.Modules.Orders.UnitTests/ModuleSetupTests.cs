using FleetSync.Modules.Orders.Application.Common;
using FleetSync.Modules.Orders.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Orders.UnitTests;

public sealed class ModuleSetupTests
{
    private static OrdersDbContext NewContext()
    {
        // Builds the model only; nothing connects to this database.
        var options = new DbContextOptionsBuilder<OrdersDbContext>();
        OrdersDbContextOptions.Configure(options, "Host=localhost;Database=unused");
        return new OrdersDbContext(options.Options);
    }

    [Fact]
    public void Tables_LiveInTheOrdersSchema()
    {
        using var context = NewContext();

        Assert.Equal("orders", context.Model.GetDefaultSchema());
    }

    [Theory]
    [InlineData("auth")]
    [InlineData("storage")]
    [InlineData("realtime")]
    [InlineData("extensions")]
    [InlineData("public")]
    public void Schema_IsNotReservedBySupabaseOrShared(string reserved) =>
        Assert.NotEqual(OrdersDbContext.Schema, reserved);

    [Fact]
    public void Errors_HaveStableCodesAndStatuses()
    {
        Assert.Equal(("orders.not_found", 404), Code(OrderErrors.NotFound("ORD-1")));
        Assert.Equal(("orders.already_quoted", 409), Code(OrderErrors.AlreadyQuoted("ORD-1")));
        Assert.Equal(("orders.invalid_transition", 409), Code(OrderErrors.InvalidTransition("ORD-1", "completed", "quoted")));

        static (string, int) Code(OrderError error) => (error.Code, error.StatusCode);
    }

    [Fact]
    public void InvalidTransition_TellsTheClientTheCurrentStatus()
    {
        var error = OrderErrors.InvalidTransition("ORD-1049", "completed", "quoted");

        Assert.Equal("completed", error.Extensions?["currentStatus"]);
        Assert.Contains("ORD-1049", error.Detail);
    }
}
