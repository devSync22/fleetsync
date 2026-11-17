using FleetSync.Modules.Auth.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Infrastructure.Persistence;

/// <summary>
/// Builds "REG-yyyy-nnnn" references from a PostgreSQL sequence, which is
/// safe under concurrent requests (no two registrations get the same number).
/// </summary>
internal sealed class ReferenceNumberGenerator(AuthDbContext db, TimeProvider clock)
    : IReferenceNumberGenerator
{
    public async Task<string> NextRegistrationReferenceAsync(CancellationToken cancellationToken)
    {
        var next = await db.Database
            .SqlQueryRaw<long>(
                $"SELECT nextval('{AuthDbContext.Schema}.{AuthDbContext.RegistrationReferenceSequence}') AS \"Value\"")
            .SingleAsync(cancellationToken);

        return Format(clock.GetUtcNow().Year, next);
    }

    /// <summary>"REG-2026-0142"; numbers above 9999 simply get more digits.</summary>
    public static string Format(int year, long number) => $"REG-{year}-{number:D4}";
}
