using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using static FleetSync.IntegrationTests.Auth.AuthTestHelpers;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>Customer registration, email verification, approval and the session lifecycle.</summary>
[Collection(DatabaseCollection.Name)]
public sealed class SessionFlowTests(AuthApiFactory factory)
{
    [Fact]
    public async Task Customer_registers_verifies_is_approved_signs_in_refreshes_and_signs_out()
    {
        var client = factory.CreateBrowserClient();
        var email = UniqueEmail("customer");

        // Register → a reference number for the "Registration submitted" screen.
        var registered = await ReadJsonAsync(await RegisterCustomerAsync(client, email));
        Assert.StartsWith("REG-", registered.GetProperty("reference").GetString());

        // No account exists yet. With the right password the customer is told what's missing.
        await AssertProblemAsync(await LoginAsync(client, email), HttpStatusCode.Forbidden, "auth.email_not_verified");

        var verify = await client.PostAsJsonAsync(
            "/api/auth/verify-email", new { token = factory.Emails.LatestToken(email, "Verify") });
        Assert.Equal(HttpStatusCode.NoContent, verify.StatusCode);

        await AssertProblemAsync(await LoginAsync(client, email), HttpStatusCode.Forbidden, "auth.pending_approval");

        // A wrong password still looks like any other failed sign-in.
        await AssertProblemAsync(await LoginAsync(client, email, "Wrong2026Pass"), HttpStatusCode.Unauthorized, "auth.invalid_credentials");

        // A Fleet Administrator approves: the account, CUSTOMER row and company are created.
        var admin = await CreateAdminClientAsync(factory);
        var approved = await ReadJsonAsync(
            await admin.PostAsync($"/api/auth/applications/{await FindApplicationIdAsync(admin, email)}/approve", content: null));
        Assert.Equal("approved", approved.GetProperty("status").GetString());
        Assert.Equal(System.Text.Json.JsonValueKind.String, approved.GetProperty("userId").ValueKind);
        Assert.True(factory.Emails.HasEmail(email, "approved"));

        // Browser sign-in: the refresh token is an HttpOnly cookie, never in the body.
        var login = await LoginAsync(client, email, rememberMe: true);
        var session = await ReadJsonAsync(login);
        Assert.Equal(System.Text.Json.JsonValueKind.Null, session.GetProperty("refreshToken").ValueKind);
        var cookie = Assert.Single(login.Headers.GetValues("Set-Cookie"));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", cookie, StringComparison.OrdinalIgnoreCase);

        // The access token works on a protected endpoint.
        using (var me = new HttpRequestMessage(HttpMethod.Get, "/api/auth/me"))
        {
            me.Headers.Authorization = new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());
            var user = await ReadJsonAsync(await client.SendAsync(me));
            Assert.Equal(email, user.GetProperty("email").GetString());
            Assert.Contains("customer", user.GetProperty("roles").EnumerateArray().Select(r => r.GetString()));
        }

        // Refresh with only the cookie (empty body), like the web app.
        var refreshed = await ReadJsonAsync(await client.PostAsync("/api/auth/refresh", content: null));
        Assert.False(string.IsNullOrEmpty(refreshed.GetProperty("accessToken").GetString()));

        // Sign out → the cookie's session can no longer be refreshed.
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync("/api/auth/logout", content: null)).StatusCode);
        await AssertProblemAsync(
            await client.PostAsync("/api/auth/refresh", content: null), HttpStatusCode.Unauthorized, "auth.invalid_refresh_token");
    }

    [Fact]
    public async Task Me_requires_an_access_token() =>
        Assert.Equal(HttpStatusCode.Unauthorized, (await factory.CreateBrowserClient().GetAsync("/api/auth/me")).StatusCode);

    [Fact]
    public async Task Duplicate_email_registration_is_rejected()
    {
        var client = factory.CreateBrowserClient();
        var email = UniqueEmail("duplicate");

        (await RegisterCustomerAsync(client, email)).EnsureSuccessStatusCode();

        // While the first application is open…
        await AssertProblemAsync(await RegisterCustomerAsync(client, email), HttpStatusCode.Conflict, "application.duplicate");
    }

    [Fact]
    public async Task Registering_an_email_that_already_has_an_account_is_rejected()
    {
        var client = factory.CreateBrowserClient();
        var email = UniqueEmail("taken");
        await RegisterApprovedCustomerAsync(factory, client, email);

        await AssertProblemAsync(await RegisterCustomerAsync(client, email), HttpStatusCode.Conflict, "auth.email_taken");
    }

    [Fact]
    public async Task Unverified_customer_application_cannot_be_approved()
    {
        var email = UniqueEmail("unverified");
        (await RegisterCustomerAsync(factory.CreateBrowserClient(), email)).EnsureSuccessStatusCode();

        var admin = await CreateAdminClientAsync(factory);
        await AssertProblemAsync(
            await admin.PostAsync($"/api/auth/applications/{await FindApplicationIdAsync(admin, email)}/approve", content: null),
            HttpStatusCode.Conflict,
            "application.email_not_verified");
    }

    [Fact]
    public async Task Invalid_registration_returns_field_errors()
    {
        var response = await RegisterCustomerAsync(factory.CreateBrowserClient(), "not-an-email", password: "weak");

        var problem = await AssertProblemAsync(response, HttpStatusCode.BadRequest, "validation_failed");
        var errors = problem.GetProperty("errors");
        Assert.True(errors.TryGetProperty("email", out _));
        Assert.True(errors.TryGetProperty("password", out _));
    }

    [Fact]
    public async Task Wrong_passwords_count_down_then_lock_the_account()
    {
        var client = factory.CreateBrowserClient();
        var email = UniqueEmail("lockout");
        await RegisterApprovedCustomerAsync(factory, client, email);

        for (var attemptsLeft = 4; attemptsLeft >= 1; attemptsLeft--)
        {
            var problem = await AssertProblemAsync(
                await LoginAsync(client, email, "Wrong2026Pass"), HttpStatusCode.Unauthorized, "auth.invalid_credentials");
            Assert.Equal(attemptsLeft, problem.GetProperty("attemptsLeft").GetInt32());
        }

        await AssertProblemAsync(await LoginAsync(client, email, "Wrong2026Pass"), HttpStatusCode.Locked, "auth.locked_out");

        // Even the right password is refused while locked.
        await AssertProblemAsync(await LoginAsync(client, email), HttpStatusCode.Locked, "auth.locked_out");
    }

    [Fact]
    public async Task Unknown_email_looks_like_a_wrong_password()
    {
        var problem = await AssertProblemAsync(
            await LoginAsync(factory.CreateBrowserClient(), UniqueEmail("nobody")),
            HttpStatusCode.Unauthorized,
            "auth.invalid_credentials");

        Assert.False(problem.TryGetProperty("attemptsLeft", out _));
    }

    [Fact]
    public async Task Reusing_a_rotated_refresh_token_ends_the_session()
    {
        var mobile = factory.CreateMobileClient();
        var email = UniqueEmail("mobile");
        await RegisterApprovedCustomerAsync(factory, mobile, email);

        // Mobile clients receive the refresh token in the body.
        var first = (await ReadJsonAsync(await LoginAsync(mobile, email))).GetProperty("refreshToken").GetString();

        var second = (await ReadJsonAsync(await mobile.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = first })))
            .GetProperty("refreshToken").GetString();
        Assert.NotEqual(first, second);

        // The old token comes back (as if stolen): rejected, and the whole family is revoked.
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = first }),
            HttpStatusCode.Unauthorized,
            "auth.invalid_refresh_token");
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = second }),
            HttpStatusCode.Unauthorized,
            "auth.invalid_refresh_token");
    }
}
