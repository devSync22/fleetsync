using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Converts enums to and from the kebab-case strings the API uses
/// ("driver", "light-lorry"), the same naming the JSON serializer applies.
/// Needed where values arrive as plain strings (multipart forms, query strings).
/// </summary>
internal static class ApiEnum
{
    public static string ToApiString<TEnum>(TEnum value)
        where TEnum : struct, Enum =>
        JsonNamingPolicy.KebabCaseLower.ConvertName(value.ToString());

    public static bool TryParse<TEnum>([NotNullWhen(true)] string? value, out TEnum result)
        where TEnum : struct, Enum
    {
        result = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var candidate = value.Trim();
        foreach (var option in Enum.GetValues<TEnum>())
        {
            if (string.Equals(ToApiString(option), candidate, StringComparison.OrdinalIgnoreCase))
            {
                result = option;
                return true;
            }
        }

        return false;
    }

    /// <summary>The accepted values, for validation messages, e.g. "driver, mechanic, coordinator".</summary>
    public static string Options<TEnum>()
        where TEnum : struct, Enum =>
        string.Join(", ", Enum.GetValues<TEnum>().Select(ToApiString));
}
