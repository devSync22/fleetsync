using System.Security.Claims;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.Registration;
using FleetSync.Modules.Auth.Application.StaffApplications;
using FleetSync.Modules.Auth.Domain.StaffApplications;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>Staff applications: public submission and Fleet Administrator review.</summary>
internal static class StaffApplicationEndpoints
{
    public static void MapStaffApplicationEndpoints(this RouteGroupBuilder group, IOptions<AuthOptions> options)
    {
        // Room for the maximum number of files plus the text fields.
        var documents = options.Value.Documents;
        var maxRequestBytes = (documents.MaxFileSizeBytes * documents.MaxFileCount) + (1024 * 1024);

        group.MapPost("/staff-applications", SubmitAsync)
            .WithName("SubmitStaffApplication")
            .WithSummary("Apply for a driver, mechanic or coordinator account (multipart/form-data)")
            .Accepts<SubmitStaffApplicationForm>("multipart/form-data")
            .ProducesValidationProblem()
            // Token-based API, no auth cookies are read here, so antiforgery tokens aren't needed.
            .DisableAntiforgery()
            .WithMetadata(new RequestSizeLimitAttribute(maxRequestBytes))
            .RequireRateLimiting(AuthPolicies.PublicRateLimit);

        var review = group.MapGroup("/staff-applications")
            .RequireAuthorization(AuthPolicies.StaffReviewer);

        review.MapGet("/", ListAsync)
            .WithName("ListStaffApplications")
            .WithSummary("List applications, newest first (filter by status)");

        review.MapGet("/{id:guid}", GetAsync)
            .WithName("GetStaffApplication")
            .WithSummary("Application details with document list");

        review.MapGet("/{id:guid}/documents/{documentId:guid}", DownloadDocumentAsync)
            .WithName("DownloadStaffApplicationDocument")
            .WithSummary("Download an attached document");

        review.MapPost("/{id:guid}/approve", ApproveAsync)
            .WithName("ApproveStaffApplication")
            .WithSummary("Approve and email the applicant an activation link");

        review.MapPost("/{id:guid}/reject", RejectAsync)
            .WithName("RejectStaffApplication")
            .WithSummary("Reject with a reason the applicant will see")
            .WithValidation<RejectStaffApplicationRequest>();
    }

    private static async Task<Results<Created<RegistrationSubmittedResponse>, ValidationProblem, ProblemHttpResult>> SubmitAsync(
        [FromForm] SubmitStaffApplicationForm form,
        IFormFileCollection files,
        StaffApplicationService applications,
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

        var result = await applications.SubmitAsync(command, cancellationToken);
        return result.IsSuccess
            ? TypedResults.Created((string?)null, result.Value)
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<PagedResponse<StaffApplicationSummaryResponse>>, ValidationProblem>> ListAsync(
        StaffApplicationService applications,
        CancellationToken cancellationToken,
        string? status = null,
        int page = 1,
        int pageSize = 20)
    {
        StaffApplicationStatus? filter = null;
        if (status is not null)
        {
            if (!ApiEnum.TryParse<StaffApplicationStatus>(status, out var parsed))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["status"] = [$"Use one of: {ApiEnum.Options<StaffApplicationStatus>()}."],
                });
            }

            filter = parsed;
        }

        return TypedResults.Ok(await applications.ListAsync(filter, page, pageSize, cancellationToken));
    }

    private static async Task<Results<Ok<StaffApplicationDetailsResponse>, ProblemHttpResult>> GetAsync(
        Guid id,
        StaffApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.GetAsync(id, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<FileStreamHttpResult, ProblemHttpResult>> DownloadDocumentAsync(
        Guid id,
        Guid documentId,
        StaffApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.OpenDocumentAsync(id, documentId, cancellationToken);
        return result.IsSuccess
            ? TypedResults.File(result.Value.Content, result.Value.ContentType, result.Value.FileName)
            : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<StaffApplicationDetailsResponse>, ProblemHttpResult>> ApproveAsync(
        Guid id,
        ClaimsPrincipal user,
        StaffApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.ApproveAsync(id, user.GetUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<StaffApplicationDetailsResponse>, ProblemHttpResult>> RejectAsync(
        Guid id,
        RejectStaffApplicationRequest request,
        ClaimsPrincipal user,
        StaffApplicationService applications,
        CancellationToken cancellationToken)
    {
        var result = await applications.RejectAsync(id, user.GetUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }
}
