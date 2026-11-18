using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Roles;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Infrastructure.Seeding;

/// <summary>
/// Development only: creates one ready-to-use account per role so the web and
/// mobile sign-in can be tried by hand without going through the
/// application → approval → activation flow each time.
///
/// Opt-in: runs only when Auth:DevTestAccounts:Password is set (User Secrets),
/// so no shared password is ever committed and nothing is seeded by accident.
/// Accounts that already exist (same email) are left untouched, so running the
/// API again never resets a password someone changed while testing.
/// </summary>
internal sealed partial class DevTestAccountsSeeder(
    IServiceScopeFactory scopeFactory,
    IHostEnvironment environment,
    IOptions<AuthOptions> options,
    TimeProvider clock,
    ILogger<DevTestAccountsSeeder> logger) : IHostedService
{
    /// <summary>
    /// One test account per role. The subtype row is built per user because it
    /// needs the new user's id (and, for customers, a company).
    /// </summary>
    private sealed record TestAccount(string LocalPart, string FullName, string Role);

    private static readonly TestAccount[] Accounts =
    [
        new("owner", "Test Fleet Owner", AuthRoles.Owner),
        new("admin", "Test Fleet Administrator", AuthRoles.FleetAdministrator),
        new("coordinator", "Test Coordinator", AuthRoles.Coordinator),
        new("customer", "Test Customer", AuthRoles.Customer),
        new("driver", "Test Driver", AuthRoles.Driver),
        new("mechanic", "Test Mechanic", AuthRoles.Mechanic),
    ];

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var settings = options.Value.DevTestAccounts;
        if (!environment.IsDevelopment() || string.IsNullOrWhiteSpace(settings.Password))
        {
            return;
        }

        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
            var roles = scope.ServiceProvider.GetRequiredService<RoleAssignment>();

            foreach (var account in Accounts)
            {
                var email = $"{account.LocalPart}@{settings.EmailDomain}";
                if (await users.FindByEmailAsync(email) is not null)
                {
                    continue;
                }

                await CreateAsync(users, db, roles, account, email, settings.Password, cancellationToken);
            }
        }
        catch (Exception exception)
        {
            // Usually the database isn't migrated yet; the API should still start.
            LogSeedError(exception);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>Creates one account, its Identity role and its EER subtype row in a single transaction.</summary>
    private async Task CreateAsync(
        UserManager<ApplicationUser> users,
        AuthDbContext db,
        RoleAssignment roles,
        TestAccount account,
        string email,
        string password,
        CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();
        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            // Seeded accounts skip email verification and approval: they can sign in straight away.
            EmailConfirmed = true,
            FullName = account.FullName,
            CreatedAt = now,
        };

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var created = await users.CreateAsync(user, password);
        var assigned = created.Succeeded
            ? await roles.AssignAsync(user, account.Role, SubtypeRow(db, account.Role, user.Id, now))
            : created;

        if (!assigned.Succeeded)
        {
            LogSeedFailed(email, string.Join(" ", assigned.Errors.Select(e => e.Description)));
            return;
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        LogSeeded(email, account.Role);
    }

    /// <summary>
    /// The role's EER subtype row (DRIVER, CUSTOMER…). A customer also gets
    /// its own test company, added to the same unit of work.
    /// </summary>
    private static object SubtypeRow(AuthDbContext db, string role, Guid userId, DateTimeOffset now)
    {
        switch (role)
        {
            case AuthRoles.Owner:
                return new FleetOwner(userId);
            case AuthRoles.FleetAdministrator:
                return new FleetAdministrator(userId);
            case AuthRoles.Coordinator:
                return new OperationalCoordinator(userId);
            case AuthRoles.Mechanic:
                return new Mechanic(userId);
            case AuthRoles.Driver:
                // Licence number is unique across drivers; the DEV- prefix keeps it clear of real ones.
                return new Driver(userId, "DEV-DRV-0001", LicenceClass.Heavy, DateOnly.FromDateTime(now.UtcDateTime.AddYears(2)));
            case AuthRoles.Customer:
                var company = new CustomerCompany("FleetSync Test Customer (Pvt) Ltd", "PV 00001", "No. 1, Test Road, Colombo 01", now);
                db.CustomerCompanies.Add(company);
                return new Customer(userId, company.Id);
            default:
                throw new ArgumentOutOfRangeException(nameof(role), role, "Unknown role.");
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Created development test account {Email} ({Role}).")]
    private partial void LogSeeded(string email, string role);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Development test account {Email} not created: {Reason}")]
    private partial void LogSeedFailed(string email, string reason);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Development test accounts seeding skipped. Is the database migrated?")]
    private partial void LogSeedError(Exception exception);
}
