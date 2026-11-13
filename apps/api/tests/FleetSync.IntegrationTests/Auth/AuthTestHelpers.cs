using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using FleetSync.Modules.Auth.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>Shared steps for the auth flow tests.</summary>
internal static class AuthTestHelpers
{
    public const string Password = "Fleet2026Pass";

    /// <summary>A unique email per test, so tests never collide in the shared database.</summary>
    public static string UniqueEmail(string prefix) => $"{prefix}-{Guid.NewGuid():N}@example.com";

    /// <summary>A random new-format (12 digit) NIC.</summary>
    public static string UniqueNic() => string.Concat(Enumerable.Range(0, 12).Select(_ => Random.Shared.Next(10)));

    public static Task<HttpResponseMessage> RegisterCustomerAsync(HttpClient client, string email, string password = Password) =>
        client.PostAsJsonAsync("/api/auth/register/customer", new
        {
            companyName = "Hayleys Freight (Pvt) Ltd",
            businessRegistrationNo = "PV 12345",
            billingAddress = "No. 25, Galle Road, Colombo 03",
            fullName = "Sachini Fernando",
            mobile = "077 123 4567",
            email,
            password,
        });

    /// <summary>Registers a customer and follows the verification email.</summary>
    public static async Task RegisterVerifiedCustomerAsync(AuthApiFactory factory, HttpClient client, string email)
    {
        (await RegisterCustomerAsync(client, email)).EnsureSuccessStatusCode();

        var token = factory.Emails.LatestToken(email, "Verify");
        var verified = await client.PostAsJsonAsync("/api/auth/verify-email", new { token });
        Assert.Equal(HttpStatusCode.NoContent, verified.StatusCode);
    }

    public static Task<HttpResponseMessage> LoginAsync(HttpClient client, string email, string password = Password, bool rememberMe = false) =>
        client.PostAsJsonAsync("/api/auth/login", new { email, password, rememberMe });

    /// <summary>Creates a Fleet Administrator directly and returns a client signed in as them.</summary>
    public static async Task<HttpClient> CreateAdminClientAsync(AuthApiFactory factory)
    {
        var email = UniqueEmail("admin");

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var admin = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                FullName = "Ayesha Perera",
                CreatedAt = DateTimeOffset.UtcNow,
            };
            Assert.True((await users.CreateAsync(admin, Password)).Succeeded);
            Assert.True((await users.AddToRoleAsync(admin, AuthRoles.FleetAdministrator)).Succeeded);
        }

        var client = factory.CreateMobileClient();
        var session = await ReadJsonAsync(await LoginAsync(client, email));
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());
        return client;
    }

    public static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.IsSuccessStatusCode, $"Expected success but got {(int)response.StatusCode}: {body}");
        return JsonDocument.Parse(body).RootElement;
    }

    /// <summary>Asserts an error response and its stable "code".</summary>
    public static async Task<JsonElement> AssertProblemAsync(HttpResponseMessage response, HttpStatusCode status, string code)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(status == response.StatusCode, $"Expected {(int)status} but got {(int)response.StatusCode}: {body}");

        var problem = JsonDocument.Parse(body).RootElement;
        Assert.Equal(code, problem.GetProperty("code").GetString());
        return problem;
    }
}
