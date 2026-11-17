using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using static FleetSync.IntegrationTests.Auth.AuthTestHelpers;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>
/// The API-wide rules from the backend guide: deny by default, ProblemDetails
/// with errorCode and traceId, the read-only Fleet Owner and list page limits.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class ApiRulesTests(AuthApiFactory factory)
{
    [Fact]
    public async Task Health_probes_are_anonymous_but_everything_else_needs_a_token()
    {
        var anonymous = factory.CreateBrowserClient();

        Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health/live")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync("/api/auth/profile-change-requests/mine")).StatusCode);
    }

    [Fact]
    public async Task Errors_carry_errorCode_and_traceId()
    {
        var response = await LoginAsync(factory.CreateBrowserClient(), UniqueEmail("nobody"));

        var problem = await AssertProblemAsync(response, HttpStatusCode.Unauthorized, "auth.invalid_credentials");
        Assert.False(string.IsNullOrEmpty(problem.GetProperty("traceId").GetString()));
        Assert.False(problem.TryGetProperty("code", out _));
    }

    [Fact]
    public async Task Validation_errors_carry_errorCode_too()
    {
        var response = await RegisterCustomerAsync(factory.CreateBrowserClient(), "not-an-email");

        var problem = await AssertProblemAsync(response, HttpStatusCode.BadRequest, "validation_failed");
        Assert.True(problem.GetProperty("errors").TryGetProperty("email", out _));
    }

    [Fact]
    public async Task Fleet_owner_can_read_the_audit_trail_but_not_manage_accounts()
    {
        var owner = await SignedInClientAsync(factory, await CreateOwnerAsync());

        Assert.Equal(HttpStatusCode.OK, (await owner.GetAsync("/api/auth/audit-log")).StatusCode);

        // Account management is Fleet Administrator only (DI-01, DI-02).
        Assert.Equal(HttpStatusCode.Forbidden, (await owner.GetAsync("/api/auth/applications")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden,
            (await owner.PutAsJsonAsync($"/api/auth/users/{Guid.NewGuid()}/status", new { isActive = false })).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await owner.GetAsync("/api/auth/profile-change-requests")).StatusCode);
    }

    [Fact]
    public async Task Customers_cannot_read_the_audit_trail()
    {
        var email = UniqueEmail("no-audit");
        await RegisterApprovedCustomerAsync(factory, factory.CreateBrowserClient(), email);
        var customer = await SignedInClientAsync(factory, email);

        Assert.Equal(HttpStatusCode.Forbidden, (await customer.GetAsync("/api/auth/audit-log")).StatusCode);
    }

    [Fact]
    public async Task Lists_default_to_20_and_cap_at_100()
    {
        var admin = await CreateAdminClientAsync(factory);

        var byDefault = await ReadJsonAsync(await admin.GetAsync("/api/auth/audit-log"));
        Assert.Equal(20, byDefault.GetProperty("pageSize").GetInt32());

        var capped = await ReadJsonAsync(await admin.GetAsync("/api/auth/audit-log?pageSize=500"));
        Assert.Equal(100, capped.GetProperty("pageSize").GetInt32());

        var applications = await ReadJsonAsync(await admin.GetAsync("/api/auth/applications?pageSize=500"));
        Assert.Equal(100, applications.GetProperty("pageSize").GetInt32());
    }

    /// <summary>Creates a Fleet Owner (Identity role + FLEET_OWNER row) and returns their email.</summary>
    private async Task<string> CreateOwnerAsync()
    {
        var email = UniqueEmail("owner");

        await using var scope = factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roles = scope.ServiceProvider.GetRequiredService<RoleAssignment>();
        var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();

        var owner = new ApplicationUser
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FullName = "Nimal Jayasuriya",
            CreatedAt = DateTimeOffset.UtcNow,
        };
        Assert.True((await users.CreateAsync(owner, Password)).Succeeded);

        // Owners come from an approved application; build one so the subtype row is written the usual way.
        var application = UserApplication.ForStaff(
            "REG-TEST", null, ApplicantRole.Owner, owner.FullName, UniqueNic(), email, "+94771234567",
            licenceNumber: null, licenceClass: null, licenceExpiry: null, documents: [], DateTimeOffset.UtcNow);
        Assert.True((await roles.AssignFromApplicationAsync(owner, application, companyId: null)).Succeeded);
        await db.SaveChangesAsync();

        return email;
    }
}
