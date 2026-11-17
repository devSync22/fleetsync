using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using FleetSync.Modules.Auth.Domain.Roles;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence.Configurations;

/// <summary>PROFILE_CHANGE_REQUEST.</summary>
internal sealed class ProfileChangeRequestConfiguration : IEntityTypeConfiguration<ProfileChangeRequest>
{
    public void Configure(EntityTypeBuilder<ProfileChangeRequest> builder)
    {
        builder.ToTable("ProfileChangeRequests");
        builder.HasKey(r => r.Id);

        // field_name VARCHAR(50), stored as the enum name ("FullName", "Phone"…).
        builder.Property(r => r.Field).HasColumnName("FieldName").HasConversion<string>().HasMaxLength(50);
        builder.Property(r => r.OldValue).HasMaxLength(255);
        builder.Property(r => r.NewValue).HasMaxLength(255).IsRequired();
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(ProfileChangeStatus.Pending);
        builder.Property(r => r.RejectionReason).HasMaxLength(500);

        builder.HasIndex(r => new { r.Status, r.RequestedAt });

        // At most one open request per user and field, enforced by the database.
        builder.HasIndex(r => new { r.UserId, r.Field })
            .IsUnique()
            .HasFilter("\"Status\" = 'Pending'")
            .HasDatabaseName("IX_ProfileChangeRequests_OnePendingPerField");

        // user_id → USER, NOT NULL. A deleted account takes its requests with it.
        builder.HasOne<ApplicationUser>().WithMany().HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);

        // approved_by → FLEET_ADMINISTRATOR, nullable.
        builder.HasOne<FleetAdministrator>().WithMany().HasForeignKey(r => r.ApprovedByUserId).OnDelete(DeleteBehavior.SetNull);
    }
}

/// <summary>AUDIT_LOG.</summary>
internal sealed class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("AuditLog");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.EntityType).HasMaxLength(50).IsRequired();
        builder.Property(a => a.EntityId).HasMaxLength(64);
        builder.Property(a => a.Action).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Details).HasMaxLength(1000);
        builder.Property(a => a.IpAddress).HasMaxLength(45);

        // The two ways the log is read: one user's history, and "all LOGIN_FAILED today".
        builder.HasIndex(a => new { a.UserId, a.OccurredAt });
        builder.HasIndex(a => new { a.Action, a.OccurredAt });

        // user_id → USER. Keep the history if the account is deleted.
        builder.HasOne<ApplicationUser>().WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}
