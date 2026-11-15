using System.Text.RegularExpressions;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Validation rules shared by several requests. They mirror the checks the
/// web and mobile forms already run, so users see the same rules everywhere;
/// the server is the authority if the two ever differ.
/// </summary>
internal static partial class FieldRules
{
    public const int PasswordMinLength = 8;
    public const int PasswordMaxLength = 128;

    /// <summary>Password policy: 8+ characters, upper- and lower-case letter, a number (web rules).</summary>
    public static IRuleBuilderOptions<T, string> Password<T>(this IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("Enter a password.")
            .MinimumLength(PasswordMinLength).WithMessage("At least 8 characters.")
            .MaximumLength(PasswordMaxLength).WithMessage("Use 128 characters or fewer.")
            .Matches("[A-Z]").WithMessage("One uppercase and one lowercase letter.")
            .Matches("[a-z]").WithMessage("One uppercase and one lowercase letter.")
            .Matches("[0-9]").WithMessage("At least one number.");

    public static IRuleBuilderOptions<T, string> Email<T>(this IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("Enter your email address.")
            .MaximumLength(256).WithMessage("Use 256 characters or fewer.")
            .Must(email => EmailPattern().IsMatch(email.Trim())).WithMessage("Enter a valid email address.");

    /// <summary>Sri Lankan mobile: 07XXXXXXXX or +947XXXXXXXX (spaces and dashes allowed).</summary>
    public static IRuleBuilderOptions<T, string> SriLankanMobile<T>(this IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("Enter a mobile number.")
            .Must(mobile => MobilePattern().IsMatch(StripSeparators(mobile)))
            .WithMessage("Enter a Sri Lankan mobile number, e.g. 077 123 4567.");

    /// <summary>Sri Lankan NIC: old format (9 digits + V/X) or new format (12 digits).</summary>
    public static IRuleBuilderOptions<T, string> Nic<T>(this IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("Enter your NIC number.")
            .Must(nic => NicPattern().IsMatch(nic.Trim()))
            .WithMessage("Enter a valid NIC: 9 digits followed by V or X, or 12 digits.");

    public static IRuleBuilderOptions<T, string> PersonName<T>(this IRuleBuilder<T, string> rule) =>
        rule
            .NotEmpty().WithMessage("Enter your full name.")
            .MaximumLength(150).WithMessage("Use 150 characters or fewer.");

    /// <summary>
    /// Optional driving licence expiry: empty, or a yyyy-MM-dd date that hasn't passed yet.
    /// </summary>
    public static IRuleBuilderOptions<T, string?> LicenceExpiry<T>(this IRuleBuilder<T, string?> rule) =>
        rule
            .Must(value => string.IsNullOrWhiteSpace(value) || TryParseDate(value, out _))
            .WithMessage("Enter the licence expiry date as YYYY-MM-DD.")
            .Must(value => !TryParseDate(value, out var date) || date >= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("This licence has expired.");

    /// <summary>Parses a yyyy-MM-dd date (the format the API uses for dates).</summary>
    public static bool TryParseDate(string? value, out DateOnly date) =>
        DateOnly.TryParseExact(value?.Trim(), "yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out date);

    /// <summary>"077 123-4567" → "+94771234567"; already-international numbers keep their form.</summary>
    public static string NormalizeMobile(string mobile)
    {
        var digits = StripSeparators(mobile);
        return digits.StartsWith('0') ? "+94" + digits[1..] : digits;
    }

    /// <summary>Trims and upper-cases the trailing V/X so the same NIC always matches.</summary>
    public static string NormalizeNic(string nic) => nic.Trim().ToUpperInvariant();

    /// <summary>Trimmed email; Identity handles case-insensitive matching itself.</summary>
    public static string NormalizeEmail(string email) => email.Trim();

    private static string StripSeparators(string value) =>
        value.Replace(" ", string.Empty, StringComparison.Ordinal).Replace("-", string.Empty, StringComparison.Ordinal);

    // Same shape the frontends accept (something@something.tld).
    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailPattern();

    [GeneratedRegex(@"^(07[0-9]{8}|\+947[0-9]{8})$")]
    private static partial Regex MobilePattern();

    [GeneratedRegex("^([0-9]{9}[VvXx]|[0-9]{12})$")]
    private static partial Regex NicPattern();
}
