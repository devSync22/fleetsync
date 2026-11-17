using FleetSync.Application.Security;
using Microsoft.AspNetCore.Authorization;

namespace FleetSync.Api.Security;

/// <summary>Registers the role lists behind <see cref="FleetSyncPolicies"/>.</summary>
public static class SharedPolicies
{
    public static AuthorizationBuilder AddFleetSyncPolicies(this AuthorizationBuilder builder) =>
        builder.AddPolicy(FleetSyncPolicies.RequireOperations, policy =>
            policy.RequireAuthenticatedUser().RequireRole(FleetSyncRoles.Coordinator));
}
