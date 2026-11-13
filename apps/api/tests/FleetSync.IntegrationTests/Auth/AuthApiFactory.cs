using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace FleetSync.IntegrationTests.Auth;

/// <summary>
/// Runs the real API in memory against the test PostgreSQL database.
/// Emails are captured instead of logged so tests can follow the emailed links.
/// </summary>
public sealed class AuthApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly string _documentsPath =
        Path.Combine(Path.GetTempPath(), "fleetsync-tests", Guid.NewGuid().ToString("N"));

    internal CapturingEmailSender Emails { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Fails before the host starts if the database isn't a disposable one.
        TestDatabase.GetConnectionString();

        // "Testing" skips Development-only behaviour such as the dev admin seeder.
        builder.UseEnvironment("Testing");
        builder.UseSetting("Auth:Jwt:SigningKey", "integration-tests-only-signing-key-0123456789");
        builder.UseSetting("Auth:Documents:StoragePath", _documentsPath);
        // Tests send many requests from one "IP"; keep the limiter out of the way.
        builder.UseSetting("Auth:RateLimiting:PermitLimit", "100000");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<IEmailSender>();
            services.AddSingleton<IEmailSender>(Emails);
        });
    }

    /// <summary>
    /// A client whose base address is https, so the Secure refresh cookie is
    /// stored and sent back like a browser would.
    /// </summary>
    public HttpClient CreateBrowserClient() =>
        CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

    /// <summary>A client that identifies itself as the mobile app.</summary>
    public HttpClient CreateMobileClient()
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });
        client.DefaultRequestHeaders.Add("X-Client-Type", "mobile");
        return client;
    }

    public async Task InitializeAsync()
    {
        await using var scope = Services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<AuthDbContext>().Database.MigrateAsync();
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();

        if (Directory.Exists(_documentsPath))
        {
            Directory.Delete(_documentsPath, recursive: true);
        }
    }
}

/// <summary>Keeps sent emails in memory and extracts the token from their links.</summary>
internal sealed partial class CapturingEmailSender : IEmailSender
{
    private readonly ConcurrentQueue<EmailMessage> _sent = new();

    public Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        _sent.Enqueue(message);
        return Task.CompletedTask;
    }

    /// <summary>The token in the newest email to <paramref name="to"/> whose subject contains the text.</summary>
    public string LatestToken(string to, string subjectContains)
    {
        var message = _sent.Reverse().FirstOrDefault(m =>
            m.To.Equals(to, StringComparison.OrdinalIgnoreCase)
            && m.Subject.Contains(subjectContains, StringComparison.OrdinalIgnoreCase))
            ?? throw new InvalidOperationException($"No \"{subjectContains}\" email was sent to {to}.");

        return Uri.UnescapeDataString(TokenPattern().Match(message.Body).Groups[1].Value);
    }

    public bool HasEmail(string to, string subjectContains) =>
        _sent.Any(m => m.To.Equals(to, StringComparison.OrdinalIgnoreCase)
                       && m.Subject.Contains(subjectContains, StringComparison.OrdinalIgnoreCase));

    [GeneratedRegex(@"token=([A-Za-z0-9_\-%]+)")]
    private static partial Regex TokenPattern();
}
