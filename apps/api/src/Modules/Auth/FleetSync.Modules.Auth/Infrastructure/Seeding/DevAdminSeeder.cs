using FleetSync.Modules.Auth.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Infrastructure.Seeding;

/// <summary>
/// Development only: creates a Fleet Administrator from Auth:DevAdmin settings
/// (User Secrets) so the staff approval flow can be tried locally.
/// Roles themselves are seeded by the migration, not here.
/// </summary>
internal sealed partial class DevAdminSeeder(
    IServiceScopeFactory scopeFactory,
    IHostEnvironment environment,
    IOptions<AuthOptions> options,
    TimeProvider clock,
    ILogger<DevAdminSeeder> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var admin = options.Value.DevAdmin;
        if (!environment.IsDevelopment() || string.IsNullOrWhiteSpace(admin.Email) || string.IsNullOrWhiteSpace(admin.Password))
        {
            return;
        }

        try
        {
            await using var scope = scopeFactory.CreateAsyncScope();
            var users = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            if (await users.FindByEmailAsync(admin.Email) is not null)
            {
                return;
            }

            var user = new ApplicationUser
            {
                UserName = admin.Email,
                Email = admin.Email,
                EmailConfirmed = true,
                FullName = admin.FullName,
                CreatedAt = clock.GetUtcNow(),
            };

            var created = await users.CreateAsync(user, admin.Password);
            if (!created.Succeeded)
            {
                LogSeedFailed(string.Join(" ", created.Errors.Select(e => e.Description)));
                return;
            }

            await users.AddToRoleAsync(user, AuthRoles.FleetAdministrator);
            LogSeeded(admin.Email);
        }
        catch (Exception exception)
        {
            // Usually the database isn't migrated yet; the API should still start.
            LogSeedError(exception);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    [LoggerMessage(Level = LogLevel.Information, Message = "Created development Fleet Administrator {Email}.")]
    private partial void LogSeeded(string email);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Development Fleet Administrator not created: {Reason}")]
    private partial void LogSeedFailed(string reason);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Development Fleet Administrator seeding skipped. Is the database migrated?")]
    private partial void LogSeedError(Exception exception);
}
