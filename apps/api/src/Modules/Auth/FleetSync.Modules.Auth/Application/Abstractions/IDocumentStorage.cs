namespace FleetSync.Modules.Auth.Application.Abstractions;

/// <summary>
/// Stores uploaded staff application files outside the database.
/// The local-disk implementation can later be swapped for cloud blob storage.
/// </summary>
internal interface IDocumentStorage
{
    /// <summary>Saves the file and returns an opaque storage key.</summary>
    Task<string> SaveAsync(Stream content, string extension, CancellationToken cancellationToken);

    /// <summary>Opens a stored file for reading, or returns null if it no longer exists.</summary>
    Task<Stream?> OpenReadAsync(string storageKey, CancellationToken cancellationToken);

    /// <summary>Deletes a stored file (used to clean up after a failed submission).</summary>
    Task DeleteAsync(string storageKey, CancellationToken cancellationToken);
}
