using Microsoft.AspNetCore.Identity;

namespace FleetSync.Modules.Auth.Domain;

/// <summary>
/// A FleetSync sign-in account (customer contact or staff member).
/// Extends the Identity user with the profile fields the apps display.
/// Email is also the user name: everyone signs in with their email.
/// </summary>
internal sealed class ApplicationUser : IdentityUser<Guid>
{
    /// <summary>Full name as entered at registration, e.g. "Sachini Fernando".</summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>When the account was created (UTC).</summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>Last successful sign-in (UTC); null until the first sign-in.</summary>
    public DateTimeOffset? LastSignInAt { get; set; }
}
