namespace FleetSync.Modules.Auth.Domain.StaffApplications;

/// <summary>
/// A file attached to a staff application (NIC copy, driving licence…).
/// The bytes live in document storage; this row holds the metadata and the storage key.
/// </summary>
internal sealed class StaffApplicationDocument
{
    // Required by EF Core.
    private StaffApplicationDocument()
    {
    }

    public StaffApplicationDocument(
        string fileName,
        string contentType,
        long sizeBytes,
        string storageKey,
        DateTimeOffset uploadedAt)
    {
        Id = Guid.CreateVersion7();
        FileName = fileName;
        ContentType = contentType;
        SizeBytes = sizeBytes;
        StorageKey = storageKey;
        UploadedAt = uploadedAt;
    }

    public Guid Id { get; private set; }

    public Guid StaffApplicationId { get; private set; }

    /// <summary>Original file name, shown to the reviewer (sanitised, no path).</summary>
    public string FileName { get; private set; } = string.Empty;

    /// <summary>Content type detected from the file bytes, not trusted from the client.</summary>
    public string ContentType { get; private set; } = string.Empty;

    public long SizeBytes { get; private set; }

    /// <summary>Opaque key used to read the file back from document storage.</summary>
    public string StorageKey { get; private set; } = string.Empty;

    public DateTimeOffset UploadedAt { get; private set; }
}
