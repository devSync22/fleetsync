using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Domain.StaffApplications;

namespace FleetSync.Modules.Auth.UnitTests;

public sealed class RefreshTokenTests
{
    [Fact]
    public void Rotate_revokes_the_old_token_and_keeps_the_family()
    {
        var token = RefreshToken.IssueNew(Guid.NewGuid(), "hash-1", isPersistent: true, TestData.Now, TimeSpan.FromDays(30));

        var successor = token.Rotate("hash-2", TestData.Now.AddMinutes(5), TimeSpan.FromDays(30));

        Assert.False(token.IsActive(TestData.Now.AddMinutes(5)));
        Assert.Equal(successor.Id, token.ReplacedByTokenId);
        Assert.Equal(token.FamilyId, successor.FamilyId);
        Assert.True(successor.IsPersistent);
        Assert.True(successor.IsActive(TestData.Now.AddMinutes(5)));
    }

    [Fact]
    public void Token_is_inactive_after_expiry()
    {
        var token = RefreshToken.IssueNew(Guid.NewGuid(), "hash", isPersistent: false, TestData.Now, TimeSpan.FromDays(1));

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
        Assert.False(new OneTimeToken(Guid.NewGuid(), OneTimeTokenPurpose.EmailVerification, "hash", TestData.Now, TimeSpan.FromHours(1))
            .IsUsable(TestData.Now.AddHours(1)));
}

public sealed class StaffApplicationTests
{
    [Fact]
    public void New_application_is_pending_with_normalized_email()
    {
        var application = TestData.StaffApplication();

        Assert.Equal(StaffApplicationStatus.Pending, application.Status);
        Assert.Equal("THARINDU@EXAMPLE.COM", application.NormalizedEmail);
        Assert.Equal("Tharindu", application.FirstName);
    }

    [Fact]
    public void Licence_details_are_dropped_for_non_drivers()
    {
        var application = TestData.StaffApplication(StaffRole.Mechanic);

        Assert.Null(application.LicenceNumber);
        Assert.Null(application.LicenceClass);
    }

    [Fact]
    public void Approve_then_activate()
    {
        var application = TestData.StaffApplication();
        var reviewer = Guid.NewGuid();
        var user = Guid.NewGuid();

        application.Approve(reviewer, "Ayesha Perera", "token-hash", TestData.Now, TimeSpan.FromDays(7));
        Assert.Equal(StaffApplicationStatus.Approved, application.Status);
        Assert.True(application.CanActivate(TestData.Now.AddDays(1)));

        application.MarkActivated(user, TestData.Now.AddDays(1));

        Assert.Equal(StaffApplicationStatus.Activated, application.Status);
        Assert.Equal(user, application.UserId);
        Assert.Null(application.ActivationTokenHash);
        Assert.False(application.CanActivate(TestData.Now.AddDays(1)));
    }

    [Fact]
    public void Activation_link_expires()
    {
        var application = TestData.StaffApplication();
        application.Approve(Guid.NewGuid(), "Ayesha", "token-hash", TestData.Now, TimeSpan.FromDays(7));

        Assert.False(application.CanActivate(TestData.Now.AddDays(7)));
        Assert.Throws<InvalidOperationException>(() => application.MarkActivated(Guid.NewGuid(), TestData.Now.AddDays(8)));
    }

    [Fact]
    public void Reviewed_application_cannot_be_reviewed_again()
    {
        var application = TestData.StaffApplication();
        application.Reject(Guid.NewGuid(), "Ayesha", "Documents unreadable", TestData.Now);

        Assert.Equal(StaffApplicationStatus.Rejected, application.Status);
        Assert.Throws<InvalidOperationException>(() =>
            application.Approve(Guid.NewGuid(), "Ayesha", "hash", TestData.Now, TimeSpan.FromDays(7)));
    }

    [Theory]
    // Enum names as strings: the enums are internal, so they can't be public test parameters.
    [InlineData(nameof(StaffRole.Driver), AuthRoles.Driver)]
    [InlineData(nameof(StaffRole.Mechanic), AuthRoles.Mechanic)]
    [InlineData(nameof(StaffRole.Coordinator), AuthRoles.Coordinator)]
    public void Staff_roles_map_to_identity_roles(string role, string expected) =>
        Assert.Equal(expected, Enum.Parse<StaffRole>(role).ToAuthRole());
}
