using System.Net;
using System.Net.Http.Json;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Auditing;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using static FleetSync.IntegrationTests.Auth.AuthTestHelpers;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>
/// The EER tables added in the Auth module: role subtypes, CUSTOMER_COMPANY,
/// PROFILE_CHANGE_REQUEST, is_active / updated_at on USER, and AUDIT_LOG.
/// </summary>
[Collection(DatabaseCollection.Name)]
public sealed class EerTablesTests(AuthApiFactory factory)
{
    [Fact]
    public async Task Approved_customer_gets_a_customer_row_linked_to_a_shared_company()
    {
        var first = UniqueEmail("company-a");
        var second = UniqueEmail("company-b");
        await RegisterApprovedCustomerAsync(factory, factory.CreateBrowserClient(), first);
        await RegisterApprovedCustomerAsync(factory, factory.CreateBrowserClient(), second);

        var companies = await factory.QueryAsync(async db =>
            await db.Customers
                .Join(db.Users, c => c.UserId, u => u.Id, (c, u) => new { u.Email, c.CompanyId })
                .Where(x => x.Email == first || x.Email == second)
                .Select(x => x.CompanyId)
                .ToListAsync());

        // Both contacts registered "PV 12345", so they belong to the same CUSTOMER_COMPANY.
        Assert.Equal(2, companies.Count);
        Assert.NotNull(companies[0]);
        Assert.Equal(companies[0], companies[1]);
    }

    [Fact]
    public async Task A_user_cannot_hold_a_second_role()
    {
        var email = await CreateAdminAsync(factory);

        await using var scope = factory.Services.CreateAsyncScope();
        var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var admin = (await users.FindByEmailAsync(email))!;

        // The unique index on UserRoles.UserId keeps the role subtypes disjoint.
        await Assert.ThrowsAnyAsync<DbUpdateException>(() => users.AddToRoleAsync(admin, AuthRoles.Driver));
    }

    [Fact]
    public async Task Profile_change_is_applied_only_after_an_administrator_approves_it()
    {
        var email = UniqueEmail("profile");
        await RegisterApprovedCustomerAsync(factory, factory.CreateBrowserClient(), email);
        var customer = await SignedInClientAsync(factory, email);

        var created = await ReadJsonAsync(await customer.PostAsJsonAsync(
            "/api/auth/profile-change-requests", new { field = "phone", newValue = "077 765 4321" }));
        Assert.Equal("pending", created.GetProperty("status").GetString());
        Assert.Equal("+94771234567", created.GetProperty("oldValue").GetString());
        Assert.Equal("+94777654321", created.GetProperty("newValue").GetString());
        var id = created.GetProperty("id").GetString();

        // One open request per field.
        await AssertProblemAsync(
            await customer.PostAsJsonAsync("/api/auth/profile-change-requests", new { field = "phone", newValue = "077 111 2222" }),
            HttpStatusCode.Conflict,
            "profile_change.duplicate");

        // Licence fields only exist for drivers.
        await AssertProblemAsync(
            await customer.PostAsJsonAsync("/api/auth/profile-change-requests", new { field = "licence-number", newValue = "X1" }),
            HttpStatusCode.BadRequest,
            "profile_change.field_not_allowed");

        // Customers can't review.
        Assert.Equal(HttpStatusCode.Forbidden,
            (await customer.PostAsync($"/api/auth/profile-change-requests/{id}/approve", content: null)).StatusCode);

        var admin = await CreateAdminClientAsync(factory);
        var approved = await ReadJsonAsync(await admin.PostAsync($"/api/auth/profile-change-requests/{id}/approve", content: null));
        Assert.Equal("approved", approved.GetProperty("status").GetString());

        var user = await factory.QueryAsync(db => db.Users.SingleAsync(u => u.Email == email));
        Assert.Equal("+94777654321", user.PhoneNumber);
        Assert.NotNull(user.UpdatedAt);

        var mine = await ReadJsonAsync(await customer.GetAsync("/api/auth/profile-change-requests/mine"));
        Assert.Equal("approved", Assert.Single(mine.EnumerateArray()).GetProperty("status").GetString());
    }

    [Fact]
    public async Task Administrator_cannot_approve_their_own_change()
    {
        var admin = await CreateAdminClientAsync(factory);
        var created = await ReadJsonAsync(await admin.PostAsJsonAsync(
            "/api/auth/profile-change-requests", new { field = "full-name", newValue = "Ayesha Silva" }));

        await AssertProblemAsync(
            await admin.PostAsync($"/api/auth/profile-change-requests/{created.GetProperty("id").GetString()}/approve", content: null),
            HttpStatusCode.Forbidden,
            "profile_change.self_review");
    }

    [Fact]
    public async Task Deactivated_account_cannot_sign_in_or_refresh_until_reactivated()
    {
        var email = UniqueEmail("inactive");
        var mobile = factory.CreateMobileClient();
        await RegisterApprovedCustomerAsync(factory, mobile, email);
        var session = await ReadJsonAsync(await LoginAsync(mobile, email));
        var userId = session.GetProperty("user").GetProperty("id").GetString();
        var refreshToken = session.GetProperty("refreshToken").GetString();

        var admin = await CreateAdminClientAsync(factory);
        var deactivated = await ReadJsonAsync(await admin.PutAsJsonAsync($"/api/auth/users/{userId}/status", new { isActive = false }));
        Assert.False(deactivated.GetProperty("isActive").GetBoolean());

        await AssertProblemAsync(await LoginAsync(mobile, email), HttpStatusCode.Forbidden, "auth.account_disabled");
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/refresh", new { refreshToken }),
            HttpStatusCode.Unauthorized,
            "auth.invalid_refresh_token");

        (await admin.PutAsJsonAsync($"/api/auth/users/{userId}/status", new { isActive = true })).EnsureSuccessStatusCode();
        (await LoginAsync(mobile, email)).EnsureSuccessStatusCode();
    }

    [Fact]
    public async Task Sign_in_bookkeeping_does_not_count_as_an_account_update()
    {
        var email = UniqueEmail("updated-at");
        var client = factory.CreateMobileClient();
        await RegisterApprovedCustomerAsync(factory, client, email);
        var before = await factory.QueryAsync(db => db.Users.AsNoTracking().Where(u => u.Email == email).Select(u => u.UpdatedAt).SingleAsync());

        // A failed attempt goes through UserManager.UpdateAsync, which flags every column as modified.
        await LoginAsync(client, email, "Wrong2026Pass");
        (await LoginAsync(client, email)).EnsureSuccessStatusCode();

        var after = await factory.QueryAsync(db => db.Users.AsNoTracking().Where(u => u.Email == email).Select(u => u.UpdatedAt).SingleAsync());
        Assert.Equal(before, after);
    }

    [Fact]
    public async Task Sign_in_and_sign_out_are_written_to_the_audit_log()
    {
        var email = UniqueEmail("audited");
        var mobile = factory.CreateMobileClient();
        await RegisterApprovedCustomerAsync(factory, mobile, email);

        await LoginAsync(mobile, email, "Wrong2026Pass");
        var session = await ReadJsonAsync(await LoginAsync(mobile, email));
        await mobile.PostAsJsonAsync("/api/auth/logout", new { refreshToken = session.GetProperty("refreshToken").GetString() });

        var admin = await CreateAdminClientAsync(factory);
        var userId = session.GetProperty("user").GetProperty("id").GetString();
        var log = await ReadJsonAsync(await admin.GetAsync($"/api/auth/audit-log?userId={userId}&pageSize=50"));
        var actions = log.GetProperty("items").EnumerateArray().Select(i => i.GetProperty("action").GetString()).ToList();

        Assert.Contains(AuditActions.LoginFailed, actions);
        Assert.Contains(AuditActions.Login, actions);
        Assert.Contains(AuditActions.Logout, actions);
    }
}
