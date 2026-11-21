using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.Roles;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Gives an account its one role, in both places the role lives:
///   - Identity's UserRoles (used by [Authorize] and the JWT "role" claim)
///   - the EER subtype table (FLEET_ADMINISTRATOR, DRIVER, CUSTOMER…)
///
/// Always call it inside the transaction that creates the account, so the two
/// can't drift apart. The UserRoles.UserId unique index stops a second role.
/// </summary>
internal sealed class RoleAssignment(AuthDbContext db, UserManager<ApplicationUser> userManager)
{
    /// <summary>The role an approved application asks for, with its subtype data.</summary>
    public Task<IdentityResult> AssignFromApplicationAsync(ApplicationUser user, UserApplication application, Guid? companyId) =>
        AssignAsync(user, application.RequestedRole.ToAuthRole(), application.RequestedRole switch
        {
            ApplicantRole.Customer => new Customer(user.Id, companyId),
            ApplicantRole.Driver => new Driver(
                user.Id,
                application.LicenceNumber ?? throw new InvalidOperationException("Driver application without a licence number."),
                application.LicenceClass ?? throw new InvalidOperationException("Driver application without a licence class."),
                application.LicenceExpiry),
            ApplicantRole.Mechanic => new Mechanic(user.Id),
            ApplicantRole.Coordinator => new OperationalCoordinator(user.Id),
            ApplicantRole.Owner => new FleetOwner(user.Id),
            _ => throw new ArgumentOutOfRangeException(nameof(application), application.RequestedRole, "Unknown role."),
        });

    /// <summary>Fleet Administrators are never applied for; they are created by an operator (or the dev seeder).</summary>
    public Task<IdentityResult> AssignFleetAdministratorAsync(ApplicationUser user) =>
        AssignAsync(user, AuthRoles.FleetAdministrator, new FleetAdministrator(user.Id));

    /// <summary>
    /// Gives <paramref name="user"/> the role and queues its subtype row. Used
    /// directly by the development test-account seeder, which has no application.
    /// </summary>
    public async Task<IdentityResult> AssignAsync(ApplicationUser user, string role, object subtypeRow)
    {
        var added = await userManager.AddToRoleAsync(user, role);
        if (!added.Succeeded)
        {
            return added;
        }

        // Saved by the caller together with the rest of the account.
        db.Add(subtypeRow);
        return IdentityResult.Success;
    }
}
