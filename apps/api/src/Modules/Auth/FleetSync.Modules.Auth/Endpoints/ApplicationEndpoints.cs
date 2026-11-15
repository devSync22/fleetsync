using System.Security.Claims;
using FleetSync.Modules.Auth.Application.Applications;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Registration;
using FleetSync.Modules.Auth.Domain.Applications;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>
/// USER_APPLICATION: public staff submission, and Fleet Administrator review
/// of every application (customers and staff) under /applications.
/// </summary>
internal static class ApplicationEndpoints
{
    public static void MapApplicationEndpoints(this RouteGroupBuilder group, IOptions<AuthOptions> options)
    {
        // Room for the maximum number of files plus the text fields.
        var documents = options.Value.Documents;
        var maxRequestBytes = (documents.MaxFileSizeBytes * documents.MaxFileCount) + (1024 * 1024);

        group.MapPost("/staff-applications", SubmitStaffAsync)
            .WithName("SubmitStaffApplication")
            .WithSummary("Apply for a driver, mechanic, coordinator or owner account (multipart/form-data)")
            .Accepts<SubmitStaffApplicationForm>("multipart/form-data")
            .ProducesValidationProblem()
            // Token-based API, no auth cookies are read here, so antiforgery tokens aren't needed.
            .DisableAntiforgery()
            .WithMetadata(new RequestSizeLimitAttribute(maxRequestBytes))
            .RequireRateLimiting(AuthPolicies.PublicRateLimit);

        var review = group.MapGroup("/applications")
            .RequireAuthorization(AuthPolicies.FleetAdministrator);

        review.MapGet("/", ListAsync)
            .WithName("ListApplications")
            .WithSummary("List applications, newest first (filter by status and role)");

        review.MapGet("/{id:guid}", GetAsync)
            .WithName("GetApplication")
            .WithSummary("Application details with document list");

        review.MapGet("/{id:guid}/documents/{documentId:guid}", DownloadDocumentAsync)
            .WithName("DownloadApplicationDocument")
            .WithSummary("Download an attached document");

        review.MapPost("/{id:guid}/approve", ApproveAsync)
            .WithName("ApproveApplication")
            .WithSummary("Approve: customers can sign in at once; staff are emailed an activation link");

        review.MapPost("/{id:guid}/reject", RejectAsync)
            .WithName("RejectApplication")
            .WithSummary("Reject with a reason the applicant will see")
            .WithValidation<RejectApplicationRequest>();
    }

    private static async Task<Results<Created<RegistrationSubmittedResponse>, ValidationProblem, ProblemHttpResult>> SubmitStaffAsync(
        [FromForm] SubmitStaffApplicationForm form,
        IFormFileCollection files,
        UserApplicationService applications,
        IServiceProvider services,
        CancellationToken cancellationToken)
    {
        var documents = files
            .Select(file => new UploadedDocument(file.FileName, file.Length, file.OpenReadStream))
            .ToList();
        var command = new SubmitStaffApplicationCommand(form, documents);

        // Validated here (not by a filter) because the fields and files are validated together.
        if (await services.ValidateAsync(command, cancellationToken) is { } invalid)
        {
            return invalid;
        }

        var result = await applications.SubmitStaffAsync(command, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created((string?)null, result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<PagedResponse<ApplicationSummaryResponse>>, ValidationProblem>> ListAsync(
        UserApplicationService applications,
        CancellationToken cancellationToken,
        string? status = null,
        string? role = null,
        int page = 1,
        int pageSize = 20)
    {
        var errors = new Dictionary<string, string[]>();

        ApplicationStatus? statusFilter = null;
        if (status is not null)
        {
            if (ApiEnum.TryParse<ApplicationStatus>(status, out var parsed))
            {
                statusFilter = parsed;
            }
            else
            {
                errors["status"] = [$"Use one of: {ApiEnum.Options<ApplicationStatus>()}."];
            }
        }

        ApplicantRole? roleFilter = null;
        if (role is not null)
        {
            if (ApiEnum.TryParse<ApplicantRole>(role, out var parsed))
            {
                roleFilter = parsed;
            }
            else
            {
                errors["role"] = [$"Use one of: {ApiEnum.Options<ApplicantRole>()}."];
            }
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors);
        }

        return TypedResults.Ok(await applications.ListAsync(statusFilter, roleFilter, page, pageSize, cancellationToken));
    }

    private static async Task<Results<Ok<ApplicationDetailsResponse>, ProblemHttpResult>> GetAsync(
        Guid id,
        UserApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.GetAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<FileStreamHttpResult, ProblemHttpResult>> DownloadDocumentAsync(
        Guid id,
        Guid documentId,
        UserApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.OpenDocumentAsync(id, documentId, cancellationToken);
        return result.IsSuccess
            ? TypedResults.File(result.Value.Content, result.Value.ContentType, result.Value.FileName)
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<ApplicationDetailsResponse>, ProblemHttpResult>> ApproveAsync(
        Guid id,
        ClaimsPrincipal user,
        UserApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.ApproveAsync(id, user.GetUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<ApplicationDetailsResponse>, ProblemHttpResult>> RejectAsync(
        Guid id,
        RejectApplicationRequest request,
        ClaimsPrincipal user,
        UserApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.RejectAsync(id, user.GetUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}
