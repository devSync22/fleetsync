using FleetSync.Modules.Auth.Domain.Applications;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.UnitTests;

/// <summary>Builders shared by the unit tests.</summary>
internal static class TestData
{
    public static readonly DateTimeOffset Now = new(2026, 11, 13, 9, 0, 0, TimeSpan.Zero);

    public static IOptions<AuthOptions> Options(Action<AuthOptions>? configure = null)
    {
        var options = new AuthOptions();
        options.Jwt.SigningKey = "unit-test-signing-key-that-is-long-enough-123";
        configure?.Invoke(options);
        return Microsoft.Extensions.Options.Options.Create(options);
    }

    public static UserApplication StaffApplication(ApplicantRole role = ApplicantRole.Driver) => UserApplication.ForStaff(
        "REG-2026-0001",
        applicationFormCode: null,
        role,
        "Tharindu Wijesinghe",
        "199012345678",
        "tharindu@example.com",
        "+94771234567",
        licenceNumber: "B1234567",
        licenceClass: LicenceClass.Heavy,
        licenceExpiry: new DateOnly(2030, 1, 31),
        documents: [],
        Now);

    public static UserApplication CustomerApplication() => UserApplication.ForCustomer(
        "REG-2026-0002",
        "Sachini Fernando",
        "sachini@example.com",
        "+94771234567",
        "Hayleys Freight (Pvt) Ltd",
        "PV 12345",
        "No. 25, Galle Road, Colombo 03",
        passwordHash: "password-hash",
        emailVerificationTokenHash: "verify-hash",
        Now,
        TimeSpan.FromHours(48));
}
