using FleetSync.Modules.Auth.Application.Abstractions;
using FleetSync.Modules.Auth.Infrastructure.Email;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Time.Testing;

namespace FleetSync.Modules.Auth.UnitTests;

/// <summary>Guide rule: never put tokens in logs. The dev sender writes emails to files instead.</summary>
public sealed class PickupFolderEmailSenderTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), "fleetsync-email-tests", Guid.NewGuid().ToString("N"));

    [Fact]
    public async Task Email_goes_to_a_file_and_the_log_never_sees_the_token()
    {
        var logger = new CapturingLogger();
        var sender = new PickupFolderEmailSender(
            TestData.Options(o => o.Email.PickupDirectory = "dev-emails"),
            new FakeEnvironment(_root),
            new FakeTimeProvider(TestData.Now),
            logger);

        await sender.SendAsync(
            new EmailMessage("sachini@example.com", "Reset your FleetSync password", "Open https://x/reset-password?token=SECRET-123"),
            CancellationToken.None);

        var file = Assert.Single(Directory.GetFiles(Path.Combine(_root, "dev-emails")));
        var content = await File.ReadAllTextAsync(file);
        Assert.StartsWith("To: sachini@example.com\nSubject: Reset your FleetSync password", content);
        Assert.Contains("token=SECRET-123", content);

        // The file name doesn't reveal the recipient either.
        Assert.DoesNotContain("sachini", Path.GetFileName(file));

        var logged = Assert.Single(logger.Messages);
        Assert.Contains("Reset your FleetSync password", logged);
        Assert.DoesNotContain("SECRET-123", logged);
        Assert.DoesNotContain("token=", logged);
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }

    private sealed class CapturingLogger : ILogger<PickupFolderEmailSender>
    {
        public List<string> Messages { get; } = [];

        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter) =>
            Messages.Add(formatter(state, exception));
    }

    private sealed class FakeEnvironment(string contentRoot) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = "Development";

        public string ApplicationName { get; set; } = "FleetSync.Api";

        public string ContentRootPath { get; set; } = contentRoot;

        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
