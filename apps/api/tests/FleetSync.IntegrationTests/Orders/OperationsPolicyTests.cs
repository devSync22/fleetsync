using System.Security.Claims;
using FleetSync.Application.Security;
using FleetSync.IntegrationTests.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.IntegrationTests.Orders;

/// <summary>
/// The shared RequireOperations policy as the real host registers it (Orders module plan §5):
/// Operational Coordinators only; never the read-only Fleet Owner.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class OperationsPolicyTests(AuthApiFactory factory)
{
    private Task<AuthorizationResult> AuthorizeAsync(ClaimsPrincipal user) =>
        factory.Services.GetRequiredService<IAuthorizationService>()
            .AuthorizeAsync(user, FleetSyncPolicies.RequireOperations);

    /// <summary>A signed-in user shaped like the Auth module's access token ("role" claim).</summary>
    private static ClaimsPrincipal SignedInAs(string role) =>
        new(new ClaimsIdentity([new Claim("role", role)], authenticationType: "Bearer", nameType: "name", roleType: "role"));

    [Fact]
    public async Task Coordinator_IsAllowed()
    {
        var result = await AuthorizeAsync(SignedInAs(FleetSyncRoles.Coordinator));

        Assert.True(result.Succeeded);
    }

    [Theory]
    [InlineData(FleetSyncRoles.Owner)]
    [InlineData(FleetSyncRoles.FleetAdministrator)]
    [InlineData(FleetSyncRoles.Driver)]
    [InlineData(FleetSyncRoles.Mechanic)]
    [InlineData(FleetSyncRoles.Customer)]
    public async Task OtherRoles_AreDenied(string role)
    {
        var result = await AuthorizeAsync(SignedInAs(role));

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task SignedOut_IsDenied()
    {
        var result = await AuthorizeAsync(new ClaimsPrincipal(new ClaimsIdentity()));

        Assert.False(result.Succeeded);
    }
}
