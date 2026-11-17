using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain.Applications;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.ProfileChanges;

/// <summary>
/// Body of POST /api/auth/profile-change-requests.
/// <see cref="Field"/> is one of "full-name", "phone", "email", "licence-number",
/// "licence-class", "licence-expiry" (the last three for drivers only).
/// </summary>
internal sealed record CreateProfileChangeRequest(string Field, string NewValue);

/// <summary>Body of POST /api/auth/profile-change-requests/{id}/reject.</summary>
internal sealed record RejectProfileChangeRequest(string Reason);

/// <summary>A profile change request, for the requester and for reviewers.</summary>
internal sealed record ProfileChangeResponse(
    Guid Id,
    Guid UserId,
    string UserFullName,
    string UserEmail,
    ProfileField Field,
    string? OldValue,
    string NewValue,
    ProfileChangeStatus Status,
    DateTimeOffset RequestedAt,
    DateTimeOffset? ReviewedAt,
    string? RejectionReason);

internal sealed class CreateProfileChangeRequestValidator : AbstractValidator<CreateProfileChangeRequest>
{
    public CreateProfileChangeRequestValidator()
    {
        RuleFor(r => r.Field)
            .Must(field => ApiEnum.TryParse<ProfileField>(field, out _))
            .WithMessage($"Choose a field: {ApiEnum.Options<ProfileField>()}.");

        RuleFor(r => r.NewValue)
            .NotEmpty().WithMessage("Enter the new value.")
            .MaximumLength(255);

        // The same rules as registration, so a change can't sneak in a value the forms would refuse.
        When(r => Is(r, ProfileField.FullName), () => RuleFor(r => r.NewValue).PersonName());
        When(r => Is(r, ProfileField.Phone), () => RuleFor(r => r.NewValue).SriLankanMobile());
        When(r => Is(r, ProfileField.Email), () => RuleFor(r => r.NewValue).Email());
        When(r => Is(r, ProfileField.LicenceNumber), () => RuleFor(r => r.NewValue).MaximumLength(30));
        When(r => Is(r, ProfileField.LicenceClass), () =>
            RuleFor(r => r.NewValue)
                .Must(value => ApiEnum.TryParse<LicenceClass>(value, out _))
                .WithMessage($"Choose a licence class: {ApiEnum.Options<LicenceClass>()}."));
        When(r => Is(r, ProfileField.LicenceExpiry), () => RuleFor(r => (string?)r.NewValue).LicenceExpiry());
    }

    private static bool Is(CreateProfileChangeRequest request, ProfileField field) =>
        ApiEnum.TryParse<ProfileField>(request.Field, out var parsed) && parsed == field;
}

internal sealed class RejectProfileChangeRequestValidator : AbstractValidator<RejectProfileChangeRequest>
{
    public RejectProfileChangeRequestValidator() =>
        RuleFor(r => r.Reason)
            .NotEmpty().WithMessage("Give a reason so the user knows why.")
            .MaximumLength(500);
}
