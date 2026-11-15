using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using FleetSync.Modules.Auth.Domain.Roles;

namespace FleetSync.Modules.Auth.UnitTests;

public sealed class RefreshTokenTests
{
    [Fact]
    public void Rotate_revokes_the_old_token_and_keeps_the_family()
    {
        var token = RefreshToken.IssueNew(Guid.NewGuid(), "hash-1", isPersistent: true, TestData.Now, TimeSpan.FromDays(30), ClientInfo.Unknown);

        var successor = token.Rotate("hash-2", TestData.Now.AddMinutes(5), TimeSpan.FromDays(30), new ClientInfo("10.0.0.1", "tests"));

        Assert.False(token.IsActive(TestData.Now.AddMinutes(5)));
        Assert.Equal(successor.Id, token.ReplacedByTokenId);
        Assert.Equal(token.FamilyId, successor.FamilyId);
        Assert.True(successor.IsPersistent);
        Assert.True(successor.IsActive(TestData.Now.AddMinutes(5)));
        Assert.Equal("10.0.0.1", successor.IpAddress);
    }

    [Fact]
    public void Token_is_inactive_after_expiry()
    {
        var token = RefreshToken.IssueNew(Guid.NewGuid(), "hash", isPersistent: false, TestData.Now, TimeSpan.FromDays(1), ClientInfo.Unknown);

        Assert.True(token.IsActive(TestData.Now.AddHours(23)));
        Assert.False(token.IsActive(TestData.Now.AddDays(1)));
    }
}

public sealed class OneTimeTokenTests
{
    [Fact]
    public void Token_can_be_used_once()
    {
        var token = new OneTimeToken(Guid.NewGuid(), OneTimeTokenPurpose.PasswordReset, "hash", TestData.Now, TimeSpan.FromHours(1));
        Assert.True(token.IsUsable(TestData.Now));

        token.Consume(TestData.Now);

        Assert.False(token.IsUsable(TestData.Now));
    }

    [Fact]
    public void Token_expires() =>
        Assert.False(new OneTimeToken(Guid.NewGuid(), OneTimeTokenPurpose.PasswordReset, "hash", TestData.Now, TimeSpan.FromHours(1))
            .IsUsable(TestData.Now.AddHours(1)));
}

public sealed class StaffApplicationTests
{
    [Fact]
    public void New_application_is_pending_with_normalized_email()
    {
        var application = TestData.StaffApplication();

        Assert.Equal(ApplicationStatus.Pending, application.Status);
        Assert.Equal("THARINDU@EXAMPLE.COM", application.NormalizedEmail);
        Assert.Equal("Tharindu", application.FirstName);

        // The activation link proves the email later, so staff need no separate verification.
        Assert.True(application.IsEmailVerified);
    }

    [Fact]
    public void Licence_details_are_dropped_for_non_drivers()
    {
        var application = TestData.StaffApplication(ApplicantRole.Mechanic);

        Assert.Null(application.LicenceNumber);
        Assert.Null(application.LicenceClass);
        Assert.Null(application.LicenceExpiry);
    }

    [Fact]
    public void Customers_cannot_use_the_staff_factory() =>
        Assert.Throws<ArgumentException>(() => TestData.StaffApplication(ApplicantRole.Customer));

    [Fact]
    public void Approve_then_activate()
    {
        var application = TestData.StaffApplication();
        var reviewer = Guid.NewGuid();
        var user = Guid.NewGuid();

        application.ApproveStaff(reviewer, "Ayesha Perera", "token-hash", TestData.Now, TimeSpan.FromDays(7));
        Assert.Equal(ApplicationStatus.Approved, application.Status);
        Assert.Equal(reviewer, application.ReviewedByUserId);
        Assert.Null(application.UserId);
        Assert.True(application.CanActivate(TestData.Now.AddDays(1)));

        application.MarkActivated(user, TestData.Now.AddDays(1));

        Assert.Equal(ApplicationStatus.Activated, application.Status);
        Assert.Equal(user, application.UserId);
        Assert.Null(application.ActivationTokenHash);
        Assert.False(application.CanActivate(TestData.Now.AddDays(1)));
    }

    [Fact]
    public void Activation_link_expires()
    {
        var application = TestData.StaffApplication();
        application.ApproveStaff(Guid.NewGuid(), "Ayesha", "token-hash", TestData.Now, TimeSpan.FromDays(7));

        Assert.False(application.CanActivate(TestData.Now.AddDays(7)));
        Assert.Throws<InvalidOperationException>(() => application.MarkActivated(Guid.NewGuid(), TestData.Now.AddDays(8)));
    }

    [Fact]
    public void Reviewed_application_cannot_be_reviewed_again()
    {
        var application = TestData.StaffApplication();
        application.Reject(Guid.NewGuid(), "Ayesha", "Documents unreadable", TestData.Now);

        Assert.Equal(ApplicationStatus.Rejected, application.Status);
        Assert.Throws<InvalidOperationException>(() =>
            application.ApproveStaff(Guid.NewGuid(), "Ayesha", "hash", TestData.Now, TimeSpan.FromDays(7)));
    }

    [Theory]
    // Enum names as strings: the enums are internal, so they can't be public test parameters.
    [InlineData(nameof(ApplicantRole.Customer), AuthRoles.Customer)]
    [InlineData(nameof(ApplicantRole.Driver), AuthRoles.Driver)]
    [InlineData(nameof(ApplicantRole.Mechanic), AuthRoles.Mechanic)]
    [InlineData(nameof(ApplicantRole.Coordinator), AuthRoles.Coordinator)]
    [InlineData(nameof(ApplicantRole.Owner), AuthRoles.Owner)]
    public void Applicant_roles_map_to_identity_roles(string role, string expected) =>
        Assert.Equal(expected, Enum.Parse<ApplicantRole>(role).ToAuthRole());
}

public sealed class CustomerApplicationTests
{
    [Fact]
    public void Customer_must_verify_email_once()
    {
        var application = TestData.CustomerApplication();
        Assert.False(application.IsEmailVerified);
        Assert.True(application.CanVerifyEmail(TestData.Now));

        application.MarkEmailVerified(TestData.Now.AddHours(1));

        Assert.True(application.IsEmailVerified);
        Assert.Null(application.EmailVerificationTokenHash);
        Assert.Throws<InvalidOperationException>(() => application.MarkEmailVerified(TestData.Now.AddHours(2)));
    }

    [Fact]
    public void Verification_link_expires() =>
        Assert.False(TestData.CustomerApplication().CanVerifyEmail(TestData.Now.AddHours(48)));

    [Fact]
    public void Approval_links_the_account_and_forgets_the_password_hash()
    {
        var application = TestData.CustomerApplication();
        var user = Guid.NewGuid();

        application.ApproveCustomer(Guid.NewGuid(), "Ayesha Perera", user, TestData.Now);

        Assert.Equal(ApplicationStatus.Approved, application.Status);
        Assert.Equal(user, application.UserId);
        Assert.Null(application.PasswordHash);
    }

    [Fact]
    public void Rejection_forgets_the_password_hash()
    {
        var application = TestData.CustomerApplication();

        application.Reject(Guid.NewGuid(), "Ayesha Perera", "Unknown company", TestData.Now);

        Assert.Null(application.PasswordHash);
        Assert.Equal("Unknown company", application.RejectionReason);
    }

    [Fact]
    public void Customer_and_staff_approvals_are_not_interchangeable()
    {
        Assert.Throws<InvalidOperationException>(() =>
            TestData.CustomerApplication().ApproveStaff(Guid.NewGuid(), "A", "hash", TestData.Now, TimeSpan.FromDays(7)));
        Assert.Throws<InvalidOperationException>(() =>
            TestData.StaffApplication().ApproveCustomer(Guid.NewGuid(), "A", Guid.NewGuid(), TestData.Now));
    }
}

public sealed class ProfileChangeRequestTests
{
    [Fact]
    public void Approve_records_the_administrator()
    {
        var request = new ProfileChangeRequest(Guid.NewGuid(), ProfileField.Phone, "+94771234567", "+94777654321", TestData.Now);
        var admin = Guid.NewGuid();

        request.Approve(admin, TestData.Now.AddHours(1));

        Assert.Equal(ProfileChangeStatus.Approved, request.Status);
        Assert.Equal(admin, request.ApprovedByUserId);
        Assert.Throws<InvalidOperationException>(() => request.Reject(admin, "late", TestData.Now));
    }

    [Fact]
    public void Reject_keeps_the_reason()
    {
        var request = new ProfileChangeRequest(Guid.NewGuid(), ProfileField.FullName, "A", "B", TestData.Now);

        request.Reject(Guid.NewGuid(), "Name must match the NIC.", TestData.Now);

        Assert.Equal(ProfileChangeStatus.Rejected, request.Status);
        Assert.Equal("Name must match the NIC.", request.RejectionReason);
    }
}

public sealed class CustomerCompanyTests
{
    [Theory]
    [InlineData("PV 12345", "PV12345")]
    [InlineData(" pv12345 ", "PV12345")]
    public void Registration_numbers_are_normalized(string input, string expected) =>
        Assert.Equal(expected, CustomerCompany.NormalizeRegistrationNo(input));
}
