namespace FleetSync.Modules.Orders.Domain;

/// <summary>One priced line of a quotation (QUOTATION_LINE, DI-13).</summary>
internal sealed class QuotationLine
{
    private QuotationLine()
    {
    }

    public QuotationLine(QuotationLineKind kind, string label, string? detail, decimal amount, int sortOrder)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(label);
        ArgumentOutOfRangeException.ThrowIfNegative(amount);

        Id = Guid.CreateVersion7();
        Kind = kind;
        Label = label.Trim();
        Detail = string.IsNullOrWhiteSpace(detail) ? null : detail.Trim();
        Amount = amount;
        SortOrder = sortOrder;
    }

    public Guid Id { get; private set; }

    public QuotationLineKind Kind { get; private set; }

    public string Label { get; private set; } = string.Empty;

    public string? Detail { get; private set; }

    public decimal Amount { get; private set; }

    public int SortOrder { get; private set; }
}

/// <summary>
/// A fare quotation for one order (EER FARE_QUOTATION + DI-13). A sent quotation is never edited (BR-32):
/// only its status and the customer's response change.
/// </summary>
internal sealed class FareQuotation
{
    private readonly List<QuotationLine> _lines = [];

    private FareQuotation()
    {
    }

    public Guid Id { get; private set; }

    public Guid OrderId { get; private set; }

    public string QuotationNumber { get; private set; } = string.Empty;

    public QuotationStatus Status { get; private set; }

    public VehicleType VehicleType { get; private set; }

    public IReadOnlyList<QuotationLine> Lines => _lines;

    /// <summary>Sum of the lines; stored so reports don't have to add them up.</summary>
    public decimal Total { get; private set; }

    public DateTimeOffset ValidUntil { get; private set; }

    public string? MessageToCustomer { get; private set; }

    public Guid PreparedByUserId { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public DateTimeOffset? SentAt { get; private set; }

    public DateTimeOffset? RespondedAt { get; private set; }

    public string? DeclineReason { get; private set; }

    /// <summary>How often the customer opened it ("Opened 2 times").</summary>
    public int ViewCount { get; private set; }

    public DateTimeOffset? FirstViewedAt { get; private set; }

    public DateTimeOffset? LastViewedAt { get; private set; }

    internal static FareQuotation CreateSent(
        Guid orderId,
        string quotationNumber,
        VehicleType vehicleType,
        IReadOnlyList<QuotationLine> lines,
        DateTimeOffset validUntil,
        string? message,
        Guid preparedByUserId,
        DateTimeOffset now)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(quotationNumber);
        if (lines.Count == 0)
        {
            throw new ArgumentException("A quotation needs at least one line.", nameof(lines));
        }

        var total = lines.Sum(l => l.Amount);
        if (total <= 0)
        {
            throw new ArgumentException("A quotation total must be more than LKR 0.", nameof(lines));
        }

        if (validUntil <= now)
        {
            throw new ArgumentException("A quotation must be valid until a time in the future.", nameof(validUntil));
        }

        var quotation = new FareQuotation
        {
            Id = Guid.CreateVersion7(now),
            OrderId = orderId,
            QuotationNumber = quotationNumber,
            Status = QuotationStatus.Sent,
            VehicleType = vehicleType,
            Total = total,
            ValidUntil = validUntil,
            MessageToCustomer = string.IsNullOrWhiteSpace(message) ? null : message.Trim(),
            PreparedByUserId = preparedByUserId,
            CreatedAt = now,
            SentAt = now,
        };
        quotation._lines.AddRange(lines);
        return quotation;
    }

    /// <summary>Counts a view by the customer; true the first time.</summary>
    internal bool RecordView(DateTimeOffset now)
    {
        ViewCount++;
        LastViewedAt = now;
        if (FirstViewedAt is not null)
        {
            return false;
        }

        FirstViewedAt = now;
        return true;
    }

    internal bool IsExpiredAt(DateTimeOffset now) => now >= ValidUntil;

    internal void MarkAccepted(DateTimeOffset now)
    {
        Status = QuotationStatus.Accepted;
        RespondedAt = now;
    }

    internal void MarkDeclined(string reason, DateTimeOffset now)
    {
        Status = QuotationStatus.Declined;
        DeclineReason = reason;
        RespondedAt = now;
    }

    internal void MarkExpired() => Status = QuotationStatus.Expired;
}
