using System.Threading.RateLimiting;
using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Application.Activation;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Passwords;
using FleetSync.Modules.Auth.Application.Registration;
using FleetSync.Modules.Auth.Application.Sessions;
using FleetSync.Modules.Auth.Application.StaffApplications;
using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Endpoints;
using FleetSync.Modules.Auth.Infrastructure.Email;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using FleetSync.Modules.Auth.Infrastructure.Seeding;
using FleetSync.Modules.Auth.Infrastructure.Storage;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FleetSync.Modules.Auth;

/// <summary>
/// The Auth module's public surface. The host calls exactly two methods:
/// <see cref="AddAuthModule"/> while building services and
/// <see cref="MapAuthEndpoints"/> after building the app. Everything else is internal.
/// </summary>
public static class AuthModule
{
    /// <summary>Route prefix for every Auth endpoint.</summary>
    public const string RoutePrefix = "/api/auth";

    /// <summary>
    /// Registers the module: database, Identity, JWT authentication,
    /// authorization policies, rate limits, validators and services.
    /// The host must also call UseAuthentication, UseAuthorization and UseRateLimiter.
    /// </summary>
    public static IServiceCollection AddAuthModule(
        this IServiceCollection services,
        IConfiguration configuration,
        string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        AddOptions(services, configuration);

        services.AddDbContext<AuthDbContext>(options => AuthDbContextOptions.Configure(options, connectionString));

        AddIdentity(services);
        AddJwtAuthentication(services);
        AddRateLimits(services);

        services.AddAuthorizationBuilder()
            .AddPolicy(AuthPolicies.StaffReviewer, policy =>
                policy.RequireAuthenticatedUser().RequireRole(AuthRoles.FleetAdministrator, AuthRoles.Owner));

        // Readiness probe: /health/ready reports unhealthy if the auth tables can't be reached.
        services.AddHealthChecks()
            .AddDbContextCheck<AuthDbContext>("auth-database", HealthStatus.Unhealthy, ["ready"]);

        services.AddValidatorsFromAssembly(typeof(AuthModule).Assembly, includeInternalTypes: true);

        services.TryAddSingleton(TimeProvider.System);

        // Infrastructure adapters (swap these for production implementations later).
        services.AddSingleton<IEmailSender, LoggingEmailSender>();
        services.AddSingleton<IDocumentStorage, LocalDocumentStorage>();
        services.AddScoped<IReferenceNumberGenerator, ReferenceNumberGenerator>();
        services.AddSingleton<AccessTokenIssuer>();
        services.AddSingleton<AuthEmails>();

        // Use-case services, one per flow.
        services.AddScoped<OneTimeTokenService>();
        services.AddScoped<SessionService>();
        services.AddScoped<CustomerRegistrationService>();
        services.AddScoped<StaffApplicationService>();
        services.AddScoped<AccountActivationService>();
        services.AddScoped<PasswordResetService>();

        services.AddHostedService<DevAdminSeeder>();

        return services;
    }

    /// <summary>Maps every Auth endpoint under <see cref="RoutePrefix"/>.</summary>
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var options = endpoints.ServiceProvider.GetRequiredService<IOptions<AuthOptions>>();

        var group = endpoints.MapGroup(RoutePrefix).WithTags("Auth");

        group.MapSessionEndpoints();
        group.MapRegistrationEndpoints();
        group.MapStaffApplicationEndpoints(options);
        group.MapAccountEndpoints();

        return endpoints;
    }

    private static void AddOptions(IServiceCollection services, IConfiguration configuration)
    {
        // Fail fast at startup instead of on the first sign-in.
        services.AddOptions<AuthOptions>()
            .Bind(configuration.GetSection(AuthOptions.SectionName))
            .Validate(
                o => o.Jwt.SigningKey.Length >= 32,
                "Auth:Jwt:SigningKey must be set (at least 32 characters). Use User Secrets locally.")
            .Validate(
                o => o.Jwt.AccessTokenMinutes > 0 && o.Jwt.RefreshTokenDays > 0 && o.Jwt.RememberMeRefreshTokenDays > 0,
                "Auth:Jwt token lifetimes must be positive.")
            .ValidateOnStart();
    }

    private static void AddIdentity(IServiceCollection services)
    {
        // AddIdentityCore: user/role management without Identity's cookie sign-in UI.
        services.AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AuthDbContext>();

        // Configured from AuthOptions so lockout stays in sync with the frontend messages.
        services.AddOptions<IdentityOptions>()
            .Configure<IOptions<AuthOptions>>((identity, auth) =>
            {
                identity.Password.RequiredLength = FieldRules.PasswordMinLength;
                identity.Password.RequireDigit = true;
                identity.Password.RequireUppercase = true;
                identity.Password.RequireLowercase = true;
                identity.Password.RequireNonAlphanumeric = false;
                identity.Password.RequiredUniqueChars = 1;

                identity.Lockout.AllowedForNewUsers = true;
                identity.Lockout.MaxFailedAccessAttempts = auth.Value.Lockout.MaxFailedAttempts;
                identity.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(auth.Value.Lockout.LockoutMinutes);

                identity.User.RequireUniqueEmail = true;
                // The user name is the email, so allow every character an email may contain.
                identity.User.AllowedUserNameCharacters = string.Empty;
            });
    }

    private static void AddJwtAuthentication(IServiceCollection services)
    {
        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();

        // Configured lazily from options so tests and environments can override settings.
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<AuthOptions>>((bearer, auth) =>
            {
                var jwt = auth.Value.Jwt;

                // Keep claim names as issued ("sub", "role") instead of the long XML-era names.
                bearer.MapInboundClaims = false;
                bearer.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwt.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwt.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = AccessTokenIssuer.CreateSigningKey(jwt.SigningKey),
                    ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = AuthClaimTypes.Name,
                    RoleClaimType = AuthClaimTypes.Role,
                };
            });
    }

    private static void AddRateLimits(IServiceCollection services)
    {
        services.AddRateLimiter(limiter =>
        {
            limiter.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Fixed window per client IP. Behind a reverse proxy, enable forwarded
            // headers in the host so RemoteIpAddress is the real client.
            limiter.AddPolicy(AuthPolicies.PublicRateLimit, context =>
            {
                var settings = context.RequestServices.GetRequiredService<IOptions<AuthOptions>>().Value.RateLimiting;
                var clientIp = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(clientIp, _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = settings.PermitLimit,
                    Window = TimeSpan.FromSeconds(settings.WindowSeconds),
                    QueueLimit = 0,
                });
            });
        });
    }
}
