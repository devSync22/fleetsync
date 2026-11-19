using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FleetSync.Modules.Orders.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddQuotationDraft : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QuotationDraft",
                schema: "orders",
                table: "TransportOrders",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuotationDraft",
                schema: "orders",
                table: "TransportOrders");
        }
    }
}
