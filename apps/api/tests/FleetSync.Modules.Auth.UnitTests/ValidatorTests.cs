using FleetSync.Modules.Auth.Application.Applications;

namespace FleetSync.Modules.Auth.UnitTests;

public sealed class SubmitStaffApplicationCommandValidatorTests
{
    private readonly SubmitStaffApplicationCommandValidator _validator = new(TestData.Options());

    private static SubmitStaffApplicationForm ValidForm(string role = "driver") => new()
    {
        FullName = "Tharindu Wijesinghe",
        Nic = "901234567V",
        Email = "tharindu@example.com",
        Mobile = "0771234567",
        Role = role,
        LicenceNumber = "B1234567",
        LicenceClass = "heavy",
    };

    private static UploadedDocument File(string name = "nic.pdf", long size = 1024) =>
        new(name, size, () => new MemoryStream());

    [Fact]
    public void Valid_driver_application_passes() =>
        Assert.True(_validator.Validate(new SubmitStaffApplicationCommand(ValidForm(), [File()])).IsValid);

    [Fact]
    public void Driver_needs_licence_details()
    {
        var form = ValidForm();
        form.LicenceNumber = null;
        form.LicenceClass = "unknown";

        var result = _validator.Validate(new SubmitStaffApplicationCommand(form, [File()]));

        Assert.Contains(result.Errors, e => e.PropertyName == "licenceNumber");
        Assert.Contains(result.Errors, e => e.PropertyName == "licenceClass");
    }

    [Fact]
    public void Mechanic_does_not_need_licence_details()
    {
        var form = ValidForm("mechanic");
        form.LicenceNumber = null;
        form.LicenceClass = null;

        Assert.True(_validator.Validate(new SubmitStaffApplicationCommand(form, [File()])).IsValid);
    }

    [Fact]
    public void Owner_can_apply_without_licence_details()
    {
        var form = ValidForm("owner");
        form.LicenceNumber = null;
        form.LicenceClass = null;

        Assert.True(_validator.Validate(new SubmitStaffApplicationCommand(form, [File()])).IsValid);
    }

    [Theory]
    // Customers register with the customer form; administrators are never applied for.
    [InlineData("customer")]
    [InlineData("fleet-administrator")]
    [InlineData("pilot")]
    public void Non_staff_roles_are_rejected(string role) =>
        Assert.Contains(
            _validator.Validate(new SubmitStaffApplicationCommand(ValidForm(role), [File()])).Errors,
            e => e.PropertyName == "role");

    [Theory]
    [InlineData("31-01-2030")]
    [InlineData("2020-01-31")]
    public void Driver_licence_expiry_must_be_a_future_iso_date(string expiry)
    {
        var form = ValidForm();
        form.LicenceExpiry = expiry;

        Assert.Contains(
            _validator.Validate(new SubmitStaffApplicationCommand(form, [File()])).Errors,
            e => e.PropertyName == "licenceExpiry");
    }

    [Fact]
    public void At_least_one_document_is_required() =>
        Assert.Contains(
            _validator.Validate(new SubmitStaffApplicationCommand(ValidForm(), [])).Errors,
            e => e.PropertyName == "documents");

    [Theory]
    [InlineData("nic.png", 1024)]
    [InlineData("nic.pdf", 6 * 1024 * 1024)]
    [InlineData("nic.pdf", 0)]
    public void Bad_files_are_rejected(string name, long size) =>
        Assert.False(_validator.Validate(new SubmitStaffApplicationCommand(ValidForm(), [File(name, size)])).IsValid);

    [Fact]
    public void Too_many_files_are_rejected() =>
        Assert.False(_validator.Validate(
            new SubmitStaffApplicationCommand(ValidForm(), Enumerable.Range(0, 6).Select(_ => File()).ToList())).IsValid);
}
