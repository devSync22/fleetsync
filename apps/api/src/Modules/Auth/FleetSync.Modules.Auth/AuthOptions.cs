namespace FleetSync.Modules.Auth;

/// <summary>
/// Settings for the Auth module, bound from the "Auth" configuration section.
/// Secrets (the JWT signing key, the dev admin password) come from User Secrets
/// or environment variables, never from committed appsettings files.
/// </summary>
internal sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public JwtOptions Jwt { get; set; } = new();

    public LinkOptions Links { get; set; } = new();

    public TokenLifetimeOptions Tokens { get; set; } = new();

    public DocumentOptions Documents { get; set; } = new();

    public EmailOptions Email { get; set; } = new();

    public LockoutOptions Lockout { get; set; } = new();

    public RateLimitOptions RateLimiting { get; set; } = new();

    public DevAdminOptions DevAdmin { get; set; } = new();

    /// <summary>One test account per role, Development only (see DevTestAccountsSeeder).</summary>
    public DevTestAccountsOptions DevTestAccounts { get; set; } = new();
}

/// <summary>How access tokens (JWT) are signed and how long sessions last.</summary>
internal sealed class JwtOptions
{
    public string Issuer { get; set; } = "fleetsync-api";

    public string Audience { get; set; } = "fleetsync-clients";

    /// <summary>HMAC-SHA256 key, at least 32 characters. Set via User Secrets: Auth:Jwt:SigningKey.</summary>
    public string SigningKey { get; set; } = string.Empty;

    /// <summary>Access tokens are short-lived; clients refresh them silently.</summary>
    public int AccessTokenMinutes { get; set; } = 15;

    /// <summary>
    /// Refresh token lifetime when "Remember me" is not ticked. 7 days per the
    /// Authentication API Contract; the browser cookie still ends with the session.
    /// </summary>
    public int RefreshTokenDays { get; set; } = 7;

    /// <summary>
    /// Refresh token lifetime when "Remember me" is ticked (persistent cookie).
    /// Same 7 days as the contract; kept separate so it can differ if the team decides to.
    /// </summary>
    public int RememberMeRefreshTokenDays { get; set; } = 7;
}

/// <summary>Base URLs used to build the links placed in emails.</summary>
internal sealed class LinkOptions
{
    /// <summary>Website root, e.g. "http://localhost:5173" (verify email, reset password).</summary>
    public string WebAppBaseUrl { get; set; } = "http://localhost:5173";

    /// <summary>Activation screen for approved staff; the token is appended as ?token=…</summary>
    public string ActivationUrl { get; set; } = "fleetsync://activate";
}

/// <summary>How long emailed links stay valid.</summary>
internal sealed class TokenLifetimeOptions
{
    public int EmailVerificationHours { get; set; } = 48;

    public int PasswordResetMinutes { get; set; } = 60;

    public int StaffActivationDays { get; set; } = 7;
}

/// <summary>Staff application document rules (match the web and mobile forms).</summary>
internal sealed class DocumentOptions
{
    /// <summary>Folder for uploaded files; relative paths are resolved against the API's content root.</summary>
    public string StoragePath { get; set; } = "App_Data/staff-documents";

    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024;

    public int MaxFileCount { get; set; } = 5;
}

/// <summary>Development email delivery (see PickupFolderEmailSender).</summary>
internal sealed class EmailOptions
{
    /// <summary>Folder the emails are saved to; relative paths are resolved against the API's content root.</summary>
    public string PickupDirectory { get; set; } = "App_Data/dev-emails";
}

/// <summary>Account lockout policy (matches MAX_LOGIN_ATTEMPTS / LOCKOUT_MINUTES on the web).</summary>
internal sealed class LockoutOptions
{
    public int MaxFailedAttempts { get; set; } = 5;

    public int LockoutMinutes { get; set; } = 15;
}

/// <summary>Per-client limits for the public auth endpoints (brute-force and spam protection).</summary>
internal sealed class RateLimitOptions
{
    /// <summary>Requests allowed per client IP in each window.</summary>
    public int PermitLimit { get; set; } = 10;

    public int WindowSeconds { get; set; } = 60;
}

/// <summary>
/// Optional Fleet Administrator created at startup in Development only,
/// so the approval flow can be tried locally. Leave empty to skip.
/// </summary>
internal sealed class DevAdminOptions
{
    public string? Email { get; set; }

    public string? Password { get; set; }

    public string FullName { get; set; } = "Development Admin";
}

/// <summary>
/// Test accounts for every role, created at startup in Development only.
/// Leave <see cref="Password"/> empty (the default) to skip seeding.
/// </summary>
internal sealed class DevTestAccountsOptions
{
    /// <summary>Shared password for all test accounts. Set via User Secrets: Auth:DevTestAccounts:Password.</summary>
    public string? Password { get; set; }

    /// <summary>Emails are "&lt;role&gt;@&lt;domain&gt;", e.g. driver@fleetsync.local.</summary>
    public string EmailDomain { get; set; } = "fleetsync.local";
}
