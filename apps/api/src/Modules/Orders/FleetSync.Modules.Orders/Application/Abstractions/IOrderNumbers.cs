namespace FleetSync.Modules.Orders.Application.Abstractions;

/// <summary>Hands out order and quotation numbers that stay unique under concurrent requests.</summary>
internal interface IOrderNumbers
{
    /// <summary>"ORD-1100", "ORD-1101", …</summary>
    Task<string> NextOrderNumberAsync(CancellationToken cancellationToken);

    /// <summary>"QT-2026-0001", "QT-2026-0002", …</summary>
    Task<string> NextQuotationNumberAsync(CancellationToken cancellationToken);
}
