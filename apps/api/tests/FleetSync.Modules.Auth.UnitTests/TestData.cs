using FleetSync.Modules.Auth.Domain.StaffApplications;
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

    public static StaffApplication StaffApplication(StaffRole role = StaffRole.Driver) => new(
        "REG-2026-0001",
        applicationFormCode: null,
        "Tharindu Wijesinghe",
        "199012345678",
        "tharindu@example.com",
        "+94771234567",
        role,
        licenceNumber: "B1234567",
        licenceClass: LicenceClass.Heavy,
        documents: [],
        Now);
}
