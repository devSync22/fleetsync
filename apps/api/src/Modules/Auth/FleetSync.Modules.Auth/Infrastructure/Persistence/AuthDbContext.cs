using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Auditing;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using FleetSync.Modules.Auth.Domain.Roles;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence;

/// <summary>
/// The Auth module's database context. Everything lives in the PostgreSQL
/// "identity" schema with its own migrations history table, so no other module
/// can depend on these tables directly (a modular-monolith boundary).
/// </summary>
internal sealed class AuthDbContext(DbContextOptions<AuthDbContext> options, TimeProvider clock)
    : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>(options)
{
    /// <summary>
    /// PostgreSQL schema owned by this module. Deliberately not "auth": hosted
    /// PostgreSQL providers such as Supabase reserve that schema for their own
    /// sign-in service, and the database user can't create tables in it.
    /// </summary>
    public const string Schema = "identity";

    /// <summary>Sequence behind REG-yyyy-nnnn references (customers and staff share it).</summary>
    public const string RegistrationReferenceSequence = "registration_reference_seq";

    /// <summary>
    /// User columns that change during sign-in bookkeeping. Changing only these
    /// is not an "update" of the account, so it doesn't touch UpdatedAt.
    /// </summary>
    private static readonly HashSet<string> BookkeepingColumns =
    [
        nameof(ApplicationUser.AccessFailedCount),
        nameof(ApplicationUser.LockoutEnd),
        nameof(ApplicationUser.LastSignInAt),
        nameof(ApplicationUser.ConcurrencyStamp),
        nameof(ApplicationUser.UpdatedAt),
    ];

    // USER_APPLICATION and its files.
    public DbSet<UserApplication> UserApplications => Set<UserApplication>();

    public DbSet<ApplicationDocument> ApplicationDocuments => Set<ApplicationDocument>();

    // EER role subtypes of USER.
    public DbSet<FleetAdministrator> FleetAdministrators => Set<FleetAdministrator>();

    public DbSet<FleetOwner> FleetOwners => Set<FleetOwner>();

    public DbSet<OperationalCoordinator> OperationalCoordinators => Set<OperationalCoordinator>();

    public DbSet<Driver> Drivers => Set<Driver>();

    public DbSet<Mechanic> Mechanics => Set<Mechanic>();

    public DbSet<Customer> Customers => Set<Customer>();

    public DbSet<CustomerCompany> CustomerCompanies => Set<CustomerCompany>();

    public DbSet<ProfileChangeRequest> ProfileChangeRequests => Set<ProfileChangeRequest>();

    public DbSet<AuditLogEntry> AuditLog => Set<AuditLogEntry>();

    // Sessions and tokens (in the database, not in the EER).
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<OneTimeToken> OneTimeTokens => Set<OneTimeToken>();

    public DbSet<PasswordHistoryEntry> PasswordHistory => Set<PasswordHistoryEntry>();

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
    {
        StampUpdatedUsers();
        return base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess)
    {
        StampUpdatedUsers();
        return base.SaveChanges(acceptAllChangesOnSuccess);
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // Identity's own table mappings first, then ours override names and add entities.
        base.OnModelCreating(builder);

        builder.HasDefaultSchema(Schema);
        builder.HasSequence<long>(RegistrationReferenceSequence).StartsAt(1);

        builder.ApplyConfigurationsFromAssembly(typeof(AuthDbContext).Assembly);
    }

    /// <summary>Sets updated_at on accounts whose details changed in this save.</summary>
    private void StampUpdatedUsers()
    {
        var now = clock.GetUtcNow();

        foreach (var entry in ChangeTracker.Entries<ApplicationUser>())
        {
            if (entry.State != EntityState.Modified)
            {
                continue;
            }

            // Compare values, not just IsModified: Identity's UserManager.UpdateAsync
            // calls DbContext.Update, which flags every column as modified even when
            // only the failed-attempt counter changed.
            var changedDetails = entry.Properties.Any(p =>
                p.IsModified
                && !BookkeepingColumns.Contains(p.Metadata.Name)
                && !Equals(p.OriginalValue, p.CurrentValue));
            if (changedDetails)
            {
                entry.Entity.UpdatedAt = now;
            }
        }
    }
}
