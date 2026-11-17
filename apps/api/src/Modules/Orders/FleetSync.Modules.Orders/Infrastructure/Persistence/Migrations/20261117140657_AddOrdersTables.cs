using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FleetSync.Modules.Orders.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrdersTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "orders");

            migrationBuilder.CreateSequence(
                name: "order_number_seq",
                schema: "orders",
                startValue: 1100L);

            migrationBuilder.CreateSequence(
                name: "quotation_number_seq",
                schema: "orders");

            migrationBuilder.CreateTable(
                name: "TransportOrders",
                schema: "orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CustomerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CustomerCompanyId = table.Column<Guid>(type: "uuid", nullable: true),
                    Customer_CompanyName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Customer_ContactName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Customer_ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Customer_ContactEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    Pickup_Address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Pickup_City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Pickup_ContactName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Pickup_ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    Destination_Address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Destination_City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Destination_ContactName = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: true),
                    Destination_ContactPhone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    PickupAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    DeliverBy = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Cargo_Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Cargo_Description = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Cargo_WeightKg = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    Cargo_UnitsCount = table.Column<int>(type: "integer", nullable: false),
                    Cargo_UnitsDetail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Cargo_Handling = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Cargo_Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RequiredVehicleType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    DistanceKm = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    PaymentStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ReviewedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TripId = table.Column<Guid>(type: "uuid", nullable: true),
                    TripNumber = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ClosedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransportOrders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FareQuotations",
                schema: "orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuotationNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    VehicleType = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Total = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ValidUntil = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    MessageToCustomer = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PreparedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    SentAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    RespondedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    DeclineReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ViewCount = table.Column<int>(type: "integer", nullable: false),
                    FirstViewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastViewedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FareQuotations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FareQuotations_TransportOrders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "orders",
                        principalTable: "TransportOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "OrderEvents",
                schema: "orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    OccurredAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ActorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    Detail = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderEvents_TransportOrders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "orders",
                        principalTable: "TransportOrders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuotationLines",
                schema: "orders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Kind = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Detail = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    QuotationId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuotationLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuotationLines_FareQuotations_QuotationId",
                        column: x => x.QuotationId,
                        principalSchema: "orders",
                        principalTable: "FareQuotations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FareQuotations_OrderId_Status",
                schema: "orders",
                table: "FareQuotations",
                columns: new[] { "OrderId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_FareQuotations_QuotationNumber",
                schema: "orders",
                table: "FareQuotations",
                column: "QuotationNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderEvents_OrderId_OccurredAt",
                schema: "orders",
                table: "OrderEvents",
                columns: new[] { "OrderId", "OccurredAt" });

            migrationBuilder.CreateIndex(
                name: "IX_QuotationLines_QuotationId",
                schema: "orders",
                table: "QuotationLines",
                column: "QuotationId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_CustomerUserId",
                schema: "orders",
                table: "TransportOrders",
                column: "CustomerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_OrderNumber",
                schema: "orders",
                table: "TransportOrders",
                column: "OrderNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TransportOrders_Status_CreatedAt",
                schema: "orders",
                table: "TransportOrders",
                columns: new[] { "Status", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderEvents",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "QuotationLines",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "FareQuotations",
                schema: "orders");

            migrationBuilder.DropTable(
                name: "TransportOrders",
                schema: "orders");

            migrationBuilder.DropSequence(
                name: "order_number_seq",
                schema: "orders");

            migrationBuilder.DropSequence(
                name: "quotation_number_seq",
                schema: "orders");
        }
    }
}
