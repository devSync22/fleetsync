using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence.Configurations;

/// <summary>USER_APPLICATION.</summary>
internal sealed class UserApplicationConfiguration : IEntityTypeConfiguration<UserApplication>
{
    public void Configure(EntityTypeBuilder<UserApplication> builder)
    {
        builder.ToTable("UserApplications", table =>
        {
            // Role-specific columns, enforced by the database as well as the code.
            table.HasCheckConstraint(
                "CK_UserApplications_Staff_Nic",
                "\"RequestedRole\" = 'Customer' OR \"Nic\" IS NOT NULL");
            table.HasCheckConstraint(
                "CK_UserApplications_Customer_Company",
                "\"RequestedRole\" <> 'Customer' OR (\"CompanyName\" IS NOT NULL AND \"BusinessRegistrationNo\" IS NOT NULL AND \"BillingAddress\" IS NOT NULL)");
            table.HasCheckConstraint(
                "CK_UserApplications_Driver_Licence",
                "\"RequestedRole\" <> 'Driver' OR (\"LicenceNumber\" IS NOT NULL AND \"LicenceClass\" IS NOT NULL)");
        });
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Reference).HasMaxLength(20).IsRequired();
        builder.Property(a => a.ApplicationFormCode).HasMaxLength(32);
        builder.Property(a => a.FullName).HasMaxLength(150).IsRequired();
        builder.Property(a => a.Nic).HasMaxLength(12);
        builder.Property(a => a.Email).HasMaxLength(256).IsRequired();
        builder.Property(a => a.NormalizedEmail).HasMaxLength(256).IsRequired();
        builder.Property(a => a.Mobile).HasMaxLength(20).IsRequired();
        builder.Property(a => a.LicenceNumber).HasMaxLength(30);
        builder.Property(a => a.CompanyName).HasMaxLength(200);
        builder.Property(a => a.BusinessRegistrationNo).HasMaxLength(50);
        builder.Property(a => a.BillingAddress).HasMaxLength(500);
        builder.Property(a => a.EmailVerificationTokenHash).HasMaxLength(64);
        builder.Property(a => a.ReviewedByName).HasMaxLength(150);
        builder.Property(a => a.RejectionReason).HasMaxLength(500);
        builder.Property(a => a.ActivationTokenHash).HasMaxLength(64);

        // Store enums as readable text so the table makes sense in SQL tools.
        builder.Property(a => a.RequestedRole).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.LicenceClass).HasConversion<string>().HasMaxLength(20);
        builder.Property(a => a.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(ApplicationStatus.Pending);

        builder.HasIndex(a => a.Reference).IsUnique();
        builder.HasIndex(a => a.ActivationTokenHash).IsUnique();
        builder.HasIndex(a => a.EmailVerificationTokenHash).IsUnique();
        builder.HasIndex(a => a.NormalizedEmail);
        builder.HasIndex(a => a.Nic);
        builder.HasIndex(a => new { a.Status, a.SubmittedAt });

        // EER: user_id UNIQUE, nullable — one application per account (NULLs don't clash).
        builder.HasIndex(a => a.UserId).IsUnique();

        // xmin concurrency token: two admins can't review the same application at once.
        builder.Property<uint>("Version").IsRowVersion();

        // Computed from other columns; not stored.
        builder.Ignore(a => a.FirstName);
        builder.Ignore(a => a.IsEmailVerified);

        builder.HasMany(a => a.Documents)
            .WithOne()
            .HasForeignKey(d => d.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        // EF Core fills the private _documents list.
        builder.Navigation(a => a.Documents).UsePropertyAccessMode(PropertyAccessMode.Field);

        // user_id → USER. Keep the application if the account is deleted (audit trail).
        builder.HasOne<ApplicationUser>().WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);

        // reviewed_by → FLEET_ADMINISTRATOR.
        builder.HasOne<FleetAdministrator>().WithMany().HasForeignKey(a => a.ReviewedByUserId).OnDelete(DeleteBehavior.SetNull);
    }
}

/// <summary>Files attached to an application (not in the EER; kept as an extra table).</summary>
internal sealed class ApplicationDocumentConfiguration : IEntityTypeConfiguration<ApplicationDocument>
{
    public void Configure(EntityTypeBuilder<ApplicationDocument> builder)
    {
        builder.ToTable("ApplicationDocuments");
        builder.HasKey(d => d.Id);

        builder.Property(d => d.FileName).HasMaxLength(255).IsRequired();
        builder.Property(d => d.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(d => d.StorageKey).HasMaxLength(300).IsRequired();
    }
}
