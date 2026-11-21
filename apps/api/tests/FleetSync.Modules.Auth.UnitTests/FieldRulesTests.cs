using FleetSync.Modules.Auth.Application.Common;
using FluentValidation;

namespace FleetSync.Modules.Auth.UnitTests;

/// <summary>The shared field rules must match what the web and mobile forms accept.</summary>
public sealed class FieldRulesTests
{
    private sealed record Input(string Value);

    private static bool Passes(Action<IRuleBuilder<Input, string>> rule, string value)
    {
        var validator = new InlineValidator<Input>();
        rule(validator.RuleFor(i => i.Value));
        return validator.Validate(new Input(value)).IsValid;
    }

    [Theory]
    [InlineData("Fleet2026", true)]
    [InlineData("short1A", false)]          // too short
    [InlineData("alllowercase1", false)]    // no upper-case
    [InlineData("ALLUPPERCASE1", false)]    // no lower-case
    [InlineData("NoNumbersHere", false)]    // no digit
    public void Password_follows_the_web_policy(string password, bool expected) =>
        Assert.Equal(expected, Passes(r => r.Password(), password));

    [Theory]
    [InlineData("901234567V", true)]
    [InlineData("901234567x", true)]
    [InlineData("199012345678", true)]
    [InlineData("90123456V", false)]
    [InlineData("1990123456789", false)]
    public void Nic_accepts_old_and_new_formats(string nic, bool expected) =>
        Assert.Equal(expected, Passes(r => r.Nic(), nic));

    [Theory]
    [InlineData("0771234567", true)]
    [InlineData("077 123 4567", true)]
    [InlineData("077-123-4567", true)]
    [InlineData("+94771234567", true)]
    [InlineData("0112345678", false)]       // landline
    [InlineData("077123456", false)]        // too short
    public void Mobile_accepts_sri_lankan_mobiles(string mobile, bool expected) =>
        Assert.Equal(expected, Passes(r => r.SriLankanMobile(), mobile));

    [Theory]
    [InlineData("077 123 4567", "+94771234567")]
    [InlineData("+94771234567", "+94771234567")]
    public void NormalizeMobile_returns_international_format(string input, string expected) =>
        Assert.Equal(expected, FieldRules.NormalizeMobile(input));

    [Fact]
    public void NormalizeNic_trims_and_uppercases() =>
        Assert.Equal("901234567V", FieldRules.NormalizeNic(" 901234567v "));
}
