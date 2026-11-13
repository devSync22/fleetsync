using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.StaffApplications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence.Configurations;

internal sealed class StaffApplicationConfiguration : IEntityTypeConfiguration<StaffApplication>
{
    public void Configure(EntityTypeBuilder<StaffApplication> builder)
    {
        builder.ToTable("StaffApplications");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Reference).HasMaxLength(20).IsRequired();
        builder.Property(a => a.ApplicationFormCode).HasMaxLength(32);
        builder.Property(a => a.FullName).HasMaxLength(150).IsRequired();
        builder.Property(a => a.Nic).HasMaxLength(12).IsRequired();
        builder.Property(a => a.Email).HasMaxLength(256).IsRequired();
        builder.Property(a => a.NormalizedEmail).HasMaxLength(256).IsRequired();
        builder.Property(a => a.Mobile).HasMaxLength(20).IsRequired();
        builder.Property(a => a.LicenceNumber).HasMaxLength(20);
        builder.Property(a => a.ReviewedByName).HasMaxLength(150);
        builder.Property(a => a.RejectionReason).HasMaxLength(500);
        builder.Property(a => a.ActivationTokenHash).HasMaxLength(64);

        // Store enums as readable text so the table makes sense in SQL tools.
        builder.Property(a => a.Role).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.LicenceClass).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasIndex(a => a.Reference).IsUnique();
        builder.HasIndex(a => a.ActivationTokenHash).IsUnique();
        builder.HasIndex(a => a.NormalizedEmail);
        builder.HasIndex(a => a.Nic);
        builder.HasIndex(a => new { a.Status, a.SubmittedAt });

        // xmin concurrency token: two admins can't review the same application at once.
        builder.Property<uint>("Version").IsRowVersion();

        // FirstName is computed from FullName; it is not a column.
        builder.Ignore(a => a.FirstName);

        builder.HasMany(a => a.Documents)
            .WithOne()
            .HasForeignKey(d => d.StaffApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        // EF Core fills the private _documents list.
        builder.Navigation(a => a.Documents).UsePropertyAccessMode(PropertyAccessMode.Field);

        // Keep the application if the account it created is ever deleted (audit trail).
        builder.HasOne<ApplicationUser>().WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}

internal sealed class StaffApplicationDocumentConfiguration : IEntityTypeConfiguration<StaffApplicationDocument>
{
    public void Configure(EntityTypeBuilder<StaffApplicationDocument> builder)
    {
        builder.ToTable("StaffApplicationDocuments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.FileName).HasMaxLength(255).IsRequired();
        builder.Property(d => d.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(d => d.StorageKey).HasMaxLength(300).IsRequired();
    }
}
