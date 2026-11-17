using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain.Applications;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Activation;

/// <summary>
/// Body of POST /api/auth/activation/lookup. The token travels in the body,
/// not the URL, so it doesn't end up in server or proxy logs.
/// </summary>
internal sealed record ActivationLookupRequest(string Token);

/// <summary>Body of POST /api/auth/activation: the emailed token and the chosen password.</summary>
internal sealed record ActivateAccountRequest(string Token, string Password);

/// <summary>
/// Details for the "Account approved" screen (mobile <c>AccountApproval</c> type).
/// StaffId and Depot are null until the staff-management feature provides them.
/// </summary>
internal sealed record AccountApprovalResponse(
    string FirstName,
    ApplicantRole Role,
    string? StaffId,
    string? Depot,
    string SignInEmail,
    string ApprovedBy,
    DateTimeOffset SentAt,
    DateTimeOffset ReviewedAt,
    DateTimeOffset ApprovedAt);

internal sealed class ActivationLookupRequestValidator : AbstractValidator<ActivationLookupRequest>
{
    public ActivationLookupRequestValidator() =>
        RuleFor(r => r.Token).NotEmpty().MaximumLength(200);
}

internal sealed class ActivateAccountRequestValidator : AbstractValidator<ActivateAccountRequest>
{
    public ActivateAccountRequestValidator()
    {
        RuleFor(r => r.Token).NotEmpty().MaximumLength(200);
        RuleFor(r => r.Password).Password();
    }
}
