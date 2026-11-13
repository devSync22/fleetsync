using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using static FleetSync.IntegrationTests.Auth.AuthTestHelpers;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>Staff application → review → activation, and password reset.</summary>
[Collection(DatabaseCollection.Name)]
public sealed class StaffAndPasswordFlowTests(AuthApiFactory factory)
{
    private static MultipartFormDataContent DriverApplication(string email, string nic, byte[]? document = null)
    {
        var form = new MultipartFormDataContent
        {
            { new StringContent("Tharindu Wijesinghe"), "fullName" },
            { new StringContent(nic), "nic" },
            { new StringContent(email), "email" },
            { new StringContent("0771234567"), "mobile" },
            { new StringContent("driver"), "role" },
            { new StringContent("B1234567"), "licenceNumber" },
            { new StringContent("heavy"), "licenceClass" },
        };

        var file = new ByteArrayContent(document ?? "%PDF-1.7 test document"u8.ToArray());
        file.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
        form.Add(file, "documents", "nic-copy.pdf");

        return form;
    }

    [Fact]
    public async Task Driver_applies_admin_approves_driver_activates_and_signs_in()
    {
        var applicant = factory.CreateMobileClient();
        var email = UniqueEmail("driver");
        var nic = UniqueNic();

        var submitted = await ReadJsonAsync(await applicant.PostAsync("/api/auth/staff-applications", DriverApplication(email, nic)));
        Assert.StartsWith("REG-", submitted.GetProperty("reference").GetString());

        // A second application with the same NIC is refused while the first is open.
        await AssertProblemAsync(
            await applicant.PostAsync("/api/auth/staff-applications", DriverApplication(UniqueEmail("other"), nic)),
            HttpStatusCode.Conflict,
            "staff_application.duplicate");

        // The applicant (anonymous) can't see the review list.
        Assert.Equal(HttpStatusCode.Unauthorized, (await applicant.GetAsync("/api/auth/staff-applications")).StatusCode);

        var admin = await CreateAdminClientAsync(factory);
        var pending = await ReadJsonAsync(await admin.GetAsync("/api/auth/staff-applications?status=pending&pageSize=100"));
        var item = pending.GetProperty("items").EnumerateArray().Single(i => i.GetProperty("email").GetString() == email);
        Assert.Equal("driver", item.GetProperty("role").GetString());
        var id = item.GetProperty("id").GetString();

        // Reviewer can open the document; its type was detected from the bytes.
        var details = await ReadJsonAsync(await admin.GetAsync($"/api/auth/staff-applications/{id}"));
        var document = Assert.Single(details.GetProperty("documents").EnumerateArray());
        var download = await admin.GetAsync($"/api/auth/staff-applications/{id}/documents/{document.GetProperty("id").GetString()}");
        Assert.Equal("application/pdf", download.Content.Headers.ContentType?.MediaType);

        var approved = await ReadJsonAsync(await admin.PostAsync($"/api/auth/staff-applications/{id}/approve", content: null));
        Assert.Equal("approved", approved.GetProperty("status").GetString());

        // Approving twice is refused.
        await AssertProblemAsync(
            await admin.PostAsync($"/api/auth/staff-applications/{id}/approve", content: null),
            HttpStatusCode.Conflict,
            "staff_application.not_pending");

        // Activation screen: load the approval, then set a password.
        var token = factory.Emails.LatestToken(email, "approved");
        var approval = await ReadJsonAsync(await applicant.PostAsJsonAsync("/api/auth/activation/lookup", new { token }));
        Assert.Equal("Tharindu", approval.GetProperty("firstName").GetString());
        Assert.Equal("Ayesha Perera", approval.GetProperty("approvedBy").GetString());

        var activated = await applicant.PostAsJsonAsync("/api/auth/activation", new { token, password = Password });
        Assert.Equal(HttpStatusCode.NoContent, activated.StatusCode);

        var session = await ReadJsonAsync(await LoginAsync(applicant, email));
        Assert.Contains("driver", session.GetProperty("user").GetProperty("roles").EnumerateArray().Select(r => r.GetString()));

        // The activation link is single-use.
        await AssertProblemAsync(
            await applicant.PostAsJsonAsync("/api/auth/activation", new { token, password = Password }),
            HttpStatusCode.BadRequest,
            "auth.invalid_token");
    }

    [Fact]
    public async Task Admin_rejects_with_a_reason_and_the_applicant_is_emailed()
    {
        var email = UniqueEmail("rejected");
        var submitted = await factory.CreateMobileClient()
            .PostAsync("/api/auth/staff-applications", DriverApplication(email, UniqueNic()));
        submitted.EnsureSuccessStatusCode();

        var admin = await CreateAdminClientAsync(factory);
        var list = await ReadJsonAsync(await admin.GetAsync("/api/auth/staff-applications?status=pending&pageSize=100"));
        var id = list.GetProperty("items").EnumerateArray()
            .Single(i => i.GetProperty("email").GetString() == email).GetProperty("id").GetString();

        var rejected = await ReadJsonAsync(await admin.PostAsJsonAsync(
            $"/api/auth/staff-applications/{id}/reject", new { reason = "NIC copy is unreadable." }));

        Assert.Equal("rejected", rejected.GetProperty("status").GetString());
        Assert.True(factory.Emails.HasEmail(email, "Update on your FleetSync staff application"));
    }

    [Fact]
    public async Task A_file_that_is_not_really_a_pdf_is_rejected()
    {
        var response = await factory.CreateMobileClient().PostAsync(
            "/api/auth/staff-applications",
            DriverApplication(UniqueEmail("fake"), UniqueNic(), "MZ not a pdf"u8.ToArray()));

        await AssertProblemAsync(response, HttpStatusCode.BadRequest, "staff_application.invalid_document");
    }

    [Fact]
    public async Task Non_admin_cannot_review_applications()
    {
        var client = factory.CreateMobileClient();
        var email = UniqueEmail("customer");
        await RegisterVerifiedCustomerAsync(factory, client, email);

        var session = await ReadJsonAsync(await LoginAsync(client, email));
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", session.GetProperty("accessToken").GetString());

        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/auth/staff-applications")).StatusCode);
    }

    [Fact]
    public async Task Password_reset_rejects_reuse_then_replaces_the_password_and_signs_out_everywhere()
    {
        var mobile = factory.CreateMobileClient();
        var email = UniqueEmail("reset");
        await RegisterVerifiedCustomerAsync(factory, mobile, email);
        var oldRefresh = (await ReadJsonAsync(await LoginAsync(mobile, email))).GetProperty("refreshToken").GetString();

        // Always 202, whether or not the email exists.
        Assert.Equal(HttpStatusCode.Accepted,
            (await mobile.PostAsJsonAsync("/api/auth/forgot-password", new { email })).StatusCode);
        Assert.Equal(HttpStatusCode.Accepted,
            (await mobile.PostAsJsonAsync("/api/auth/forgot-password", new { email = UniqueEmail("nobody") })).StatusCode);

        var token = factory.Emails.LatestToken(email, "Reset");

        // The page shows "For <email>".
        var lookup = await ReadJsonAsync(await mobile.PostAsJsonAsync("/api/auth/reset-password/lookup", new { token }));
        Assert.Equal(email, lookup.GetProperty("email").GetString());

        // The current password can't be reused.
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = Password }),
            HttpStatusCode.BadRequest,
            "auth.password_reused");

        const string newPassword = "Brand2026New";
        var reset = await mobile.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword });
        Assert.Equal(HttpStatusCode.NoContent, reset.StatusCode);

        await AssertProblemAsync(await LoginAsync(mobile, email), HttpStatusCode.Unauthorized, "auth.invalid_credentials");
        (await LoginAsync(mobile, email, newPassword)).EnsureSuccessStatusCode();

        // Existing sessions were ended and the link is single-use.
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = oldRefresh }),
            HttpStatusCode.Unauthorized,
            "auth.invalid_refresh_token");
        await AssertProblemAsync(
            await mobile.PostAsJsonAsync("/api/auth/reset-password", new { token, newPassword = "Another2026Pw" }),
            HttpStatusCode.BadRequest,
            "auth.invalid_token");
    }
}
