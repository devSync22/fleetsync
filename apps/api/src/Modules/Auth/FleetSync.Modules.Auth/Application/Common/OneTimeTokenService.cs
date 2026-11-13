using FleetSync.Modules.Auth.Domain;
using FleetSync.Modules.Auth.Infrastructure.Persistence;
using FleetSync.Modules.Auth.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// Issues and redeems the single-use tokens in emailed links
/// (email verification, password reset).
/// </summary>
internal sealed class OneTimeTokenService(AuthDbContext db, TimeProvider clock)
{
    /// <summary>
    /// Creates a new token and retires any unused one with the same purpose,
    /// so only the most recent email's link works. Changes are saved by the caller.
    /// </summary>
    public async Task<string> IssueAsync(
        Guid userId,
        OneTimeTokenPurpose purpose,
        TimeSpan lifetime,
        CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow();

        var previous = await db.OneTimeTokens
            .Where(t => t.UserId == userId && t.Purpose == purpose && t.ConsumedAt == null)
            .ToListAsync(cancellationToken);
        previous.ForEach(t => t.Consume(now));

        var raw = SecureToken.Generate();
        db.OneTimeTokens.Add(new OneTimeToken(userId, purpose, SecureToken.Hash(raw), now, lifetime));

        return raw;
    }

    /// <summary>Finds a usable (unexpired, unused) token, or null.</summary>
    public async Task<OneTimeToken?> FindUsableAsync(
        string rawToken,
        OneTimeTokenPurpose purpose,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(rawToken))
        {
            return null;
        }

        var hash = SecureToken.Hash(rawToken);
        var token = await db.OneTimeTokens
            .SingleOrDefaultAsync(t => t.TokenHash == hash && t.Purpose == purpose, cancellationToken);

        return token is not null && token.IsUsable(clock.GetUtcNow()) ? token : null;
    }
}
