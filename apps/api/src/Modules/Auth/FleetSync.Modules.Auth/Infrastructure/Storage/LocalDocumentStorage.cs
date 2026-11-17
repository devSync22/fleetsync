using FleetSync.Modules.Auth.Application.Abstractions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Infrastructure.Storage;

/// <summary>
/// Stores staff documents on the local disk under <see cref="DocumentOptions.StoragePath"/>,
/// in "yyyy/MM/{random}.ext" folders. Files are named with random ids so a
/// client-supplied file name never reaches the file system.
/// </summary>
internal sealed class LocalDocumentStorage : IDocumentStorage
{
    private readonly string _root;
    private readonly TimeProvider _clock;

    public LocalDocumentStorage(IOptions<AuthOptions> options, IHostEnvironment environment, TimeProvider clock)
    {
        _root = Path.GetFullPath(Path.Combine(environment.ContentRootPath, options.Value.Documents.StoragePath));
        _clock = clock;
    }

    public async Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken)
    {
        var now = _clock.GetUtcNow();
        var storageKey = $"{now:yyyy}/{now:MM}/{Guid.CreateVersion7():N}{extension}";
        var path = ResolvePath(storageKey);

        Directory.CreateDirectory(Path.GetDirectoryName(path)!);

        // CreateNew: never overwrite an existing file.
        await using var file = new FileStream(path, FileMode.CreateNew, FileAccess.Write, FileShare.None);
        await content.CopyToAsync(file, cancellationToken);

        return storageKey;
    }

    public Task<Stream?> OpenReadAsync(string storageKey, CancellationToken cancellationToken)
    {
        var path = ResolvePath(storageKey);

        Stream? stream = File.Exists(path)
            ? new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read, 4096, useAsync: true)
            : null;

        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string storageKey, CancellationToken cancellationToken)
    {
        var path = ResolvePath(storageKey);
        if (File.Exists(path))
        {
            File.Delete(path);
        }

        return Task.CompletedTask;
    }

    /// <summary>Maps a key to a full path and refuses anything outside the storage root.</summary>
    private string ResolvePath(string storageKey)
    {
        var path = Path.GetFullPath(Path.Combine(_root, storageKey));
        if (!path.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("Storage key points outside the document storage folder.");
        }

        return path;
    }
}
