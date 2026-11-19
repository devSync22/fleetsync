namespace FleetSync.Modules.Orders.Application.Common;

/// <summary>
/// Times are stored in UTC; the business runs in Sri Lanka. Use this whenever a calendar day matters
/// (the pickup-date filter, development seed data).
/// </summary>
internal static class LocalTime
{
    /// <summary>Asia/Colombo (UTC+05:30, no daylight saving).</summary>
    public static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo");

    /// <summary>The UTC instants where the given Sri Lankan calendar day starts and ends (end exclusive).</summary>
    public static (DateTimeOffset Start, DateTimeOffset End) DayBounds(DateOnly day)
    {
        var start = At(day, TimeOnly.MinValue);
        return (start, At(day.AddDays(1), TimeOnly.MinValue));
    }

    /// <summary>A Sri Lankan date and wall-clock time, as a UTC instant.</summary>
    public static DateTimeOffset At(DateOnly day, TimeOnly time)
    {
        var local = day.ToDateTime(time, DateTimeKind.Unspecified);
        return new DateTimeOffset(local, Zone.GetUtcOffset(local)).ToUniversalTime();
    }

    /// <summary>Today's date in Sri Lanka.</summary>
    public static DateOnly Today(TimeProvider clock) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTime(clock.GetUtcNow(), Zone).DateTime);
}
