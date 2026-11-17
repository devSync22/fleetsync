namespace FleetSync.Modules.Auth.Application.Abstractions;

/// <summary>
/// Issues human-readable registration references such as "REG-2026-0142",
/// shown on the "Registration submitted" screen and in emails.
/// </summary>
internal interface IReferenceNumberGenerator
{
    Task<string> NextRegistrationReferenceAsync(CancellationToken cancellationToken);
}
