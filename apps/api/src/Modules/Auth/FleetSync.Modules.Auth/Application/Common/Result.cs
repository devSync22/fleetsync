using System.Diagnostics.CodeAnalysis;

namespace FleetSync.Modules.Auth.Application.Common;

/// <summary>
/// The outcome of an operation that returns no value: success, or an <see cref="AuthError"/>.
/// Used for expected failures so services don't throw exceptions for normal flows.
/// </summary>
internal readonly struct Result
{
    private Result(AuthError? error) => Error = error;

    public AuthError? Error { get; }

    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public static Result Success() => new(null);

    public static implicit operator Result(AuthError error) => new(error);
}

/// <summary>The outcome of an operation that returns a <typeparamref name="T"/> on success.</summary>
internal readonly struct Result<T>
{
    private Result(T? value, AuthError? error)
    {
        Value = value;
        Error = error;
    }

    public T? Value { get; }

    public AuthError? Error { get; }

    [MemberNotNullWhen(true, nameof(Value))]
    [MemberNotNullWhen(false, nameof(Error))]
    public bool IsSuccess => Error is null;

    public static implicit operator Result<T>(T value) => new(value, null);

    public static implicit operator Result<T>(AuthError error) => new(default, error);
}
