namespace FleetSync.Modules.Auth.Infrastructure.Storage;

/// <summary>The real type of an uploaded file, detected from its first bytes.</summary>
internal sealed record DetectedFileType(string ContentType, string Extension);

/// <summary>
/// Checks uploaded files by their "magic bytes" rather than trusting the
/// file name or the Content-Type sent by the client. Only PDF and JPEG are
/// accepted, matching the web and mobile forms.
/// </summary>
internal static class DocumentInspector
{
    private static readonly byte[] PdfSignature = "%PDF"u8.ToArray();
    private static readonly byte[] JpegSignature = [0xFF, 0xD8, 0xFF];

    private static readonly HashSet<string> AllowedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".pdf", ".jpg", ".jpeg" };

    /// <summary>True when the file name has an allowed extension.</summary>
    public static bool HasAllowedExtension(string fileName) =>
        AllowedExtensions.Contains(Path.GetExtension(fileName));

    /// <summary>Returns the detected type, or null when the bytes are not a PDF or JPEG.</summary>
    public static async Task<DetectedFileType?> DetectAsync(Stream stream, CancellationToken cancellationToken)
    {
        var header = new byte[4];
        var read = await stream.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, cancellationToken);

        if (read >= PdfSignature.Length && header.AsSpan(0, PdfSignature.Length).SequenceEqual(PdfSignature))
        {
            return new DetectedFileType("application/pdf", ".pdf");
        }

        if (read >= JpegSignature.Length && header.AsSpan(0, JpegSignature.Length).SequenceEqual(JpegSignature))
        {
            return new DetectedFileType("image/jpeg", ".jpg");
        }

        return null;
    }

    /// <summary>Strips any path and odd characters from a client file name before storing it.</summary>
    public static string SanitizeFileName(string fileName)
    {
        var name = Path.GetFileName(fileName.Replace('\\', '/'));
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string(name.Where(c => !invalid.Contains(c) && !char.IsControl(c)).ToArray()).Trim();

        if (cleaned.Length == 0)
        {
            cleaned = "document";
        }

        return cleaned.Length > 255 ? cleaned[^255..] : cleaned;
    }
}
