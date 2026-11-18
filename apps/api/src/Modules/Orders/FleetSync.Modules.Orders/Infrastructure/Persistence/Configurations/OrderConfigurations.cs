using System.Text.Json;
using System.Text.Json.Serialization;
using FleetSync.Modules.Orders.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetSync.Modules.Orders.Infrastructure.Persistence.Configurations;

/// <summary>How a <see cref="QuotationDraft"/> is stored in its jsonb column (enums as names, like every other column).</summary>
internal static class DraftJson
{
    private static readonly JsonSerializerOptions Options = new() { Converters = { new JsonStringEnumConverter() } };

    public static string Serialize(QuotationDraft? draft) => JsonSerializer.Serialize(draft, Options);

    public static QuotationDraft? Deserialize(string json) => JsonSerializer.Deserialize<QuotationDraft>(json, Options);
}

/// <summary>TRANSPORT_ORDER with its owned customer, locations and cargo (plan §2).</summary>
internal sealed class TransportOrderConfiguration : IEntityTypeConfiguration<TransportOrder>
{
    public void Configure(EntityTypeBuilder<TransportOrder> builder)
    {
        builder.ToTable("TransportOrders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OrderNumber).HasMaxLength(20);
        builder.HasIndex(o => o.OrderNumber).IsUnique();

        builder.OwnsOne(o => o.Customer, customer =>
        {
            customer.Property(c => c.CompanyName).HasMaxLength(200);
            customer.Property(c => c.ContactName).HasMaxLength(150);
            customer.Property(c => c.ContactPhone).HasMaxLength(30);
            customer.Property(c => c.ContactEmail).HasMaxLength(256);
        });
        builder.Navigation(o => o.Customer).IsRequired();

        builder.OwnsOne(o => o.Pickup, ConfigureLocation);
        builder.Navigation(o => o.Pickup).IsRequired();
        builder.OwnsOne(o => o.Destination, ConfigureLocation);
        builder.Navigation(o => o.Destination).IsRequired();

        builder.OwnsOne(o => o.Cargo, cargo =>
        {
            cargo.Property(c => c.Description).HasMaxLength(200);
            cargo.Property(c => c.WeightKg).HasPrecision(10, 2);
            cargo.Property(c => c.UnitsDetail).HasMaxLength(200);
            cargo.Property(c => c.Handling).HasMaxLength(200);
            cargo.Property(c => c.Note).HasMaxLength(1000);
        });
        builder.Navigation(o => o.Cargo).IsRequired();

        builder.Property(o => o.TripNumber).HasMaxLength(30);

        // The unsent draft is read and written as a whole, never queried, so one jsonb column is enough.
        builder.Property(o => o.Draft)
            .HasColumnName("QuotationDraft")
            .HasColumnType("jsonb")
            .HasConversion(
                draft => DraftJson.Serialize(draft),
                json => DraftJson.Deserialize(json),
                new ValueComparer<QuotationDraft?>(
                    (a, b) => DraftJson.Serialize(a) == DraftJson.Serialize(b),
                    draft => DraftJson.Serialize(draft).GetHashCode(),
                    draft => DraftJson.Deserialize(DraftJson.Serialize(draft))));

        // xmin: concurrent changes to the same order fail instead of silently overwriting.
        builder.Property(o => o.Version).IsRowVersion();

        // The Submitted orders list filters by status and sorts by submission time.
        builder.HasIndex(o => new { o.Status, o.CreatedAt });
        builder.HasIndex(o => o.CustomerUserId);

        builder.HasMany(o => o.Quotations).WithOne().HasForeignKey(q => q.OrderId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.Events).WithOne().HasForeignKey(e => e.OrderId).OnDelete(DeleteBehavior.Cascade);
    }

    private static void ConfigureLocation<T>(OwnedNavigationBuilder<T, Location> location)
        where T : class
    {
        location.Property(l => l.Address).HasMaxLength(300);
        location.Property(l => l.City).HasMaxLength(100);
        location.Property(l => l.ContactName).HasMaxLength(150);
        location.Property(l => l.ContactPhone).HasMaxLength(30);
    }
}

/// <summary>FARE_QUOTATION and its QUOTATION_LINE rows (DI-13).</summary>
internal sealed class FareQuotationConfiguration : IEntityTypeConfiguration<FareQuotation>
{
    public void Configure(EntityTypeBuilder<FareQuotation> builder)
    {
        builder.ToTable("FareQuotations");
        builder.HasKey(q => q.Id);

        builder.Property(q => q.QuotationNumber).HasMaxLength(20);
        builder.HasIndex(q => q.QuotationNumber).IsUnique();
        builder.Property(q => q.MessageToCustomer).HasMaxLength(1000);
        builder.Property(q => q.DeclineReason).HasMaxLength(500);
        builder.HasIndex(q => new { q.OrderId, q.Status });

        builder.OwnsMany(q => q.Lines, line =>
        {
            line.ToTable("QuotationLines");
            line.WithOwner().HasForeignKey("QuotationId");
            line.HasKey(l => l.Id);
            line.Property(l => l.Label).HasMaxLength(100);
            line.Property(l => l.Detail).HasMaxLength(200);
        });
    }
}

/// <summary>The order history (new table, DI-30). Read newest-first per order.</summary>
internal sealed class OrderEventConfiguration : IEntityTypeConfiguration<OrderEvent>
{
    public void Configure(EntityTypeBuilder<OrderEvent> builder)
    {
        builder.ToTable("OrderEvents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Detail).HasMaxLength(500);
        builder.HasIndex(e => new { e.OrderId, e.OccurredAt });
    }
}
