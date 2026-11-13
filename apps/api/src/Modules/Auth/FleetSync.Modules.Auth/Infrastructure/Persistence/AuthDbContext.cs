using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.StaffApplications;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence;

/// <summary>
/// The Auth module's database context. Everything lives in the PostgreSQL
/// "auth" schema with its own migrations history table, so no other module
/// can depend on these tables directly (a modular-monolith boundary).
/// </summary>
internal sealed class AuthDbContext(DbContextOptions<AuthDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    /// <summary>PostgreSQL schema owned by this module.</summary>
    public const string Schema = "auth";

    /// <summary>Sequence behind REG-yyyy-nnnn references (customers and staff share it).</summary>
    public const string RegistrationReferenceSequence = "registration_reference_seq";

    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();

    public DbSet<StaffApplication> StaffApplications => Set<StaffApplication>();

    public DbSet<StaffApplicationDocument> StaffApplicationDocuments => Set<StaffApplicationDocument>();

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<OneTimeToken> OneTimeTokens => Set<OneTimeToken>();

    public DbSet<PasswordHistoryEntry> PasswordHistory => Set<PasswordHistoryEntry>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Identity's own table mappings first, then ours override names and add entities.
        base.OnModelCreating(builder);

        builder.HasDefaultSchema(Schema);
        builder.HasSequence<long>(RegistrationReferenceSequence).StartsAt(1);

        builder.ApplyConfigurationsFromAssembly(typeof(AuthDbContext).Assembly);
    }
}
