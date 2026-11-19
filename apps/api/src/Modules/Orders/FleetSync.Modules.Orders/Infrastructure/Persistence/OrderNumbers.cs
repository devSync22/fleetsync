using FleetSync.Modules.Orders.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace FleetSync.Modules.Orders.Infrastructure.Persistence;

/// <summary>
/// Order and quotation numbers from PostgreSQL sequences, which are safe under concurrent requests
/// (no two orders get the same number). A number used by a failed save is simply skipped.
/// </summary>
internal sealed class OrderNumbers(OrdersDbContext db, TimeProvider clock) : IOrderNumbers
{
    // Built only from constants (sequence names can't be SQL parameters), so nothing user-supplied reaches the SQL.
    private const string NextOrderSql =
        "SELECT nextval('" + OrdersDbContext.Schema + "." + OrdersDbContext.OrderNumberSequence + "') AS \"Value\"";

    private const string NextQuotationSql =
        "SELECT nextval('" + OrdersDbContext.Schema + "." + OrdersDbContext.QuotationNumberSequence + "') AS \"Value\"";

    public async Task<string> NextOrderNumberAsync(CancellationToken cancellationToken) =>
        FormatOrder(await NextAsync(NextOrderSql, cancellationToken));

    public async Task<string> NextQuotationNumberAsync(CancellationToken cancellationToken) =>
        FormatQuotation(clock.GetUtcNow().Year, await NextAsync(NextQuotationSql, cancellationToken));

    /// <summary>"ORD-1100".</summary>
    public static string FormatOrder(long number) => $"ORD-{number}";

    /// <summary>"QT-2026-0007"; numbers above 9999 simply get more digits.</summary>
    public static string FormatQuotation(int year, long number) => $"QT-{year}-{number:D4}";

    private Task<long> NextAsync(string sql, CancellationToken cancellationToken) =>
        db.Database.SqlQueryRaw<long>(sql).SingleAsync(cancellationToken);
}
