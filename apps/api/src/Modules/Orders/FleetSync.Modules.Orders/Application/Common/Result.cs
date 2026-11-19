using System.Diagnostics.CodeAnalysis;

namespace FleetSync.Modules.Orders.Application.Common;

/// <summary>
/// The outcome of an operation that returns no value: success, or an <see cref="OrderError"/>.
/// Used for expected failures so services don't throw exceptions for normal flows.
/// </summary>
internal readonly struct Result
{
    private Result(OrderError? error) => Error = error;

    public OrderError? Error { get; }

    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public static Result Success() => new(null);

    public static implicit operator Result(OrderError error) => new(error);
}

/// <summary>The outcome of an operation that returns a <typeparamref name="T"/> on success.</summary>
internal readonly struct Result<T>
{
    private Result(T? value, OrderError? error)
    {
        Value = value;
        Error = error;
    }

    public T? Value { get; }

    public OrderError? Error { get; }

    [MemberNotNullWhen(true, nameof(Value))]
    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public static implicit operator Result<T>(T value) => new(value, null);

    public static implicit operator Result<T>(OrderError error) => new(default, error);
}
