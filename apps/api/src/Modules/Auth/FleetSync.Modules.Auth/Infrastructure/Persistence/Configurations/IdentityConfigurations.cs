using FleetSync.Modules.Auth.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence.Configurations;

/// <summary>Renames Identity's "AspNet*" tables and adds the FleetSync user columns.</summary>
internal sealed class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.ToTable("Users");

        builder.Property(u => u.FullName).HasMaxLength(150).IsRequired();
        builder.Property(u => u.PhoneNumber).HasMaxLength(20);

        // is_active DEFAULT TRUE (the database default also covers rows inserted by SQL tools).
        // HasSentinel(true): EF sends the value only when it differs from the
        // default, so an explicit false is still written.
        builder.Property(u => u.IsActive).HasDefaultValue(true).HasSentinel(true);

        // EER: email is UNIQUE. Identity's own EmailIndex is not unique (it only
        // checks in code), so the database enforces it too.
        builder.HasIndex(u => u.NormalizedEmail).HasDatabaseName("EmailIndex").IsUnique();
    }
}

/// <summary>Role table plus the fixed set of FleetSync roles, seeded by the migration.</summary>
internal sealed class RoleConfiguration : IEntityTypeConfiguration<IdentityRole<Guid>>
{
    // Fixed ids and concurrency stamps keep the seed data stable between migrations.
    private static readonly (Guid Id, string Name)[] SeededRoles =
    [
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000001"), AuthRoles.Owner),
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000002"), AuthRoles.FleetAdministrator),
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000003"), AuthRoles.Coordinator),
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000004"), AuthRoles.Driver),
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000005"), AuthRoles.Mechanic),
        (Guid.Parse("0199a0c0-0000-7000-8000-000000000006"), AuthRoles.Customer),
    ];

    public void Configure(EntityTypeBuilder<IdentityRole<Guid>> builder)
    {
        builder.ToTable("Roles");

        builder.HasData(SeededRoles.Select(role => new IdentityRole<Guid>
        {
            Id = role.Id,
            Name = role.Name,
            NormalizedName = role.Name.ToUpperInvariant(),
            ConcurrencyStamp = role.Id.ToString(),
        }));
    }
}

internal sealed class UserRoleConfiguration : IEntityTypeConfiguration<IdentityUserRole<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
    {
        builder.ToTable("UserRoles");

        // EER: each user has exactly one role (disjoint specialisation). Identity
        // allows many; this unique index makes the database refuse a second one.
        builder.HasIndex(r => r.UserId).IsUnique();
    }
}

internal sealed class UserClaimConfiguration : IEntityTypeConfiguration<IdentityUserClaim<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserClaim<Guid>> builder) => builder.ToTable("UserClaims");
}

internal sealed class UserLoginConfiguration : IEntityTypeConfiguration<IdentityUserLogin<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserLogin<Guid>> builder) => builder.ToTable("UserLogins");
}

internal sealed class UserTokenConfiguration : IEntityTypeConfiguration<IdentityUserToken<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUserToken<Guid>> builder) => builder.ToTable("UserTokens");
}

internal sealed class RoleClaimConfiguration : IEntityTypeConfiguration<IdentityRoleClaim<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityRoleClaim<Guid>> builder) => builder.ToTable("RoleClaims");
}
