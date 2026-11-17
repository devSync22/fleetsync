using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Domain.Applications;
using FluentValidation;

namespace FleetSync.Modules.Auth.Application.Applications;

/// <summary>
/// A file received with the application, decoupled from ASP.NET Core's IFormFile
/// so the service can be tested without HTTP.
/// </summary>
internal sealed record UploadedDocument(string FileName, long Length, Func<Stream> OpenReadStream);

/// <summary>
/// Multipart form fields of POST /api/auth/staff-applications
/// (web <c>StaffApplicationRequest</c> and mobile <c>AccountRequest</c>).
/// Enum fields arrive as text ("driver", "light-lorry") and are parsed by the validator.
/// </summary>
internal sealed class SubmitStaffApplicationForm
{
    public string? ApplicationFormCode { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Nic { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Mobile { get; set; } = string.Empty;

    /// <summary>"driver", "mechanic", "coordinator" or "owner" (customers use /register/customer).</summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>Drivers only.</summary>
    public string? LicenceNumber { get; set; }

    /// <summary>Drivers only: "light", "light-lorry", "heavy" or "heavy-trailer".</summary>
    public string? LicenceClass { get; set; }

    /// <summary>Drivers only, optional: licence expiry date as yyyy-MM-dd.</summary>
    public string? LicenceExpiry { get; set; }
}

/// <summary>The form fields plus the uploaded files, validated as one unit.</summary>
internal sealed record SubmitStaffApplicationCommand(
    SubmitStaffApplicationForm Form,
    IReadOnlyList<UploadedDocument> Documents);

/// <summary>Body of POST /api/auth/applications/{id}/reject.</summary>
internal sealed record RejectApplicationRequest(string Reason);

/// <summary>A row in the Fleet Administrator's review list.</summary>
internal sealed record ApplicationSummaryResponse(
    Guid Id,
    string Reference,
    string FullName,
    string Email,
    ApplicantRole Role,
    ApplicationStatus Status,
    bool EmailVerified,
    DateTimeOffset SubmittedAt);

/// <summary>Metadata of one attached document (the file is downloaded separately).</summary>
internal sealed record ApplicationDocumentResponse(Guid Id, string FileName, string ContentType, long SizeBytes);

/// <summary>Everything a reviewer needs to decide on an application.</summary>
internal sealed record ApplicationDetailsResponse(
    Guid Id,
    string Reference,
    string? ApplicationFormCode,
    ApplicantRole Role,
    string FullName,
    string? Nic,
    string Email,
    bool EmailVerified,
    string Mobile,
    string? LicenceNumber,
    LicenceClass? LicenceClass,
    DateOnly? LicenceExpiry,
    string? CompanyName,
    string? BusinessRegistrationNo,
    string? BillingAddress,
    ApplicationStatus Status,
    DateTimeOffset SubmittedAt,
    DateTimeOffset? ReviewedAt,
    string? ReviewedByName,
    string? RejectionReason,
    DateTimeOffset? ActivatedAt,
    Guid? UserId,
    IReadOnlyList<ApplicationDocumentResponse> Documents);

/// <summary>A page of results with the total count, for list screens.</summary>
internal sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

/// <summary>Checks the fields and the files' count/size/extension (contents are checked when saved).</summary>
internal sealed class SubmitStaffApplicationCommandValidator : AbstractValidator<SubmitStaffApplicationCommand>
{
    public SubmitStaffApplicationCommandValidator(Microsoft.Extensions.Options.IOptions<AuthOptions> options)
    {
        var documents = options.Value.Documents;

        RuleFor(c => c.Form.FullName).PersonName().OverridePropertyName("fullName");
        RuleFor(c => c.Form.Nic).Nic().OverridePropertyName("nic");
        RuleFor(c => c.Form.Email).Email().OverridePropertyName("email");
        RuleFor(c => c.Form.Mobile).SriLankanMobile().OverridePropertyName("mobile");

        RuleFor(c => c.Form.ApplicationFormCode)
            .MaximumLength(32)
            .OverridePropertyName("applicationFormCode");

        RuleFor(c => c.Form.Role)
            .Must(role => TryParseStaffRole(role, out _))
            .WithMessage("Choose a role: driver, mechanic, coordinator, owner.")
            .OverridePropertyName("role");

        // Licence details are required for drivers only.
        When(c => IsDriver(c.Form), () =>
        {
            RuleFor(c => c.Form.LicenceNumber)
                .NotEmpty().WithMessage("Enter your driving licence number.")
                .MaximumLength(30)
                .OverridePropertyName("licenceNumber");

            RuleFor(c => c.Form.LicenceClass)
                .Must(value => ApiEnum.TryParse<LicenceClass>(value, out _))
                .WithMessage($"Choose a licence class: {ApiEnum.Options<LicenceClass>()}.")
                .OverridePropertyName("licenceClass");

            RuleFor(c => c.Form.LicenceExpiry)
                .LicenceExpiry()
                .OverridePropertyName("licenceExpiry");
        });

        RuleFor(c => c.Documents)
            .NotEmpty().WithMessage("Add your NIC copy (and driving licence if you're applying as a driver).")
            .Must(files => files.Count <= documents.MaxFileCount)
            .WithMessage($"Attach at most {documents.MaxFileCount} files.")
            .OverridePropertyName("documents");

        RuleForEach(c => c.Documents)
            .Must(file => file.Length > 0).WithMessage(file => "This file is empty.")
            .Must(file => file.Length <= documents.MaxFileSizeBytes)
            .WithMessage($"Each file must be {documents.MaxFileSizeBytes / (1024 * 1024)} MB or smaller.")
            .Must(file => Infrastructure.Storage.DocumentInspector.HasAllowedExtension(file.FileName))
            .WithMessage("Only PDF or JPG files are accepted.")
            .OverridePropertyName("documents");
    }

    /// <summary>Staff roles only: customers register with the customer form.</summary>
    public static bool TryParseStaffRole(string? value, out ApplicantRole role) =>
        ApiEnum.TryParse(value, out role) && role.IsStaff();

    private static bool IsDriver(SubmitStaffApplicationForm form) =>
        TryParseStaffRole(form.Role, out var role) && role == ApplicantRole.Driver;
}

internal sealed class RejectApplicationRequestValidator : AbstractValidator<RejectApplicationRequest>
{
    public RejectApplicationRequestValidator() =>
        RuleFor(r => r.Reason)
            .NotEmpty().WithMessage("Give a reason so the applicant knows what to fix.")
            .MaximumLength(500);
}
