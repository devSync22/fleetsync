using System.Security.Claims;
using FleetSync.Modules.Auth.Application.Applications;
using FleetSync.Modules.Auth.Application.Common;
using FleetSync.Modules.Auth.Application.ProfileChanges;
using FleetSync.Modules.Auth.Application.Users;
using FleetSync.Modules.Auth.Domain.ProfileChanges;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Routing;

namespace FleetSync.Modules.Auth.Endpoints;

/// <summary>
/// PROFILE_CHANGE_REQUEST (signed-in users ask, Fleet Administrators review),
/// account activation status (is_active) and the audit log.
/// </summary>
internal static class ProfileAndUserEndpoints
{
    public static void MapProfileAndUserEndpoints(this RouteGroupBuilder group)
    {
        var changes = group.MapGroup("/profile-change-requests");

        changes.MapPost("/", RequestChangeAsync)
            .WithName("RequestProfileChange")
            .WithSummary("Ask to change one account detail (needs a Fleet Administrator's approval)")
            .WithValidation<CreateProfileChangeRequest>()
            .RequireAuthorization();

        changes.MapGet("/mine", ListMineAsync)
            .WithName("ListMyProfileChanges")
            .WithSummary("The signed-in user's profile change requests")
            .RequireAuthorization();

        changes.MapGet("/", ListAsync)
            .WithName("ListProfileChanges")
            .WithSummary("Review list, oldest first (filter by status)")
            .RequireAuthorization(AuthPolicies.FleetAdministrator);

        changes.MapPost("/{id:guid}/approve", ApproveAsync)
            .WithName("ApproveProfileChange")
            .WithSummary("Approve and apply the change")
            .RequireAuthorization(AuthPolicies.FleetAdministrator);

        changes.MapPost("/{id:guid}/reject", RejectAsync)
            .WithName("RejectProfileChange")
            .WithSummary("Reject with a reason the user will see")
            .WithValidation<RejectProfileChangeRequest>()
            .RequireAuthorization(AuthPolicies.FleetAdministrator);

        group.MapPut("/users/{id:guid}/status", SetStatusAsync)
            .WithName("SetUserStatus")
            .WithSummary("Deactivate or reactivate an account (deactivating ends its sessions)")
            .RequireAuthorization(AuthPolicies.FleetAdministrator);

        group.MapGet("/audit-log", ListAuditLogAsync)
            .WithName("ListAuditLog")
            .WithSummary("Security events, newest first (filter by userId and action)")
            .RequireAuthorization(AuthPolicies.FleetAdministrator);
    }

    private static async Task<Results<Created<ProfileChangeResponse>, ProblemHttpResult>> RequestChangeAsync(
        CreateProfileChangeRequest request,
        ClaimsPrincipal user,
        ProfileChangeService changes,
        CancellationToken cancellationToken)
    {
        var result = await changes.RequestAsync(user.GetUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Created((string?)null, result.Value) : result.Error.ToProblem();
    }

    private static async Task<Ok<IReadOnlyList<ProfileChangeResponse>>> ListMineAsync(
        ClaimsPrincipal user,
        ProfileChangeService changes,
        CancellationToken cancellationToken) =>
        TypedResults.Ok(await changes.ListMineAsync(user.GetUserId(), cancellationToken));

    private static async Task<Results<Ok<PagedResponse<ProfileChangeResponse>>, ValidationProblem>> ListAsync(
        ProfileChangeService changes,
        CancellationToken cancellationToken,
        string? status = null,
        int page = 1,
        int pageSize = 20)
    {
        ProfileChangeStatus? filter = null;
        if (status is not null)
        {
            if (!ApiEnum.TryParse<ProfileChangeStatus>(status, out var parsed))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["status"] = [$"Use one of: {ApiEnum.Options<ProfileChangeStatus>()}."],
                });
            }

            filter = parsed;
        }

        return TypedResults.Ok(await changes.ListAsync(filter, page, pageSize, cancellationToken));
    }

    private static async Task<Results<Ok<ProfileChangeResponse>, ProblemHttpResult>> ApproveAsync(
        Guid id,
        ClaimsPrincipal user,
        ProfileChangeService changes,
        CancellationToken cancellationToken)
    {
        var result = await changes.ApproveAsync(id, user.GetUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<ProfileChangeResponse>, ProblemHttpResult>> RejectAsync(
        Guid id,
        RejectProfileChangeRequest request,
        ClaimsPrincipal user,
        ProfileChangeService changes,
        CancellationToken cancellationToken)
    {
        var result = await changes.RejectAsync(id, user.GetUserId(), request, cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Results<Ok<UserStatusResponse>, ProblemHttpResult>> SetStatusAsync(
        Guid id,
        SetUserStatusRequest request,
        ClaimsPrincipal user,
        UserAdministrationService users,
        CancellationToken cancellationToken)
    {
        var result = await users.SetActiveAsync(id, request.IsActive, user.GetUserId(), cancellationToken);
        return result.IsSuccess ? TypedResults.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<Ok<PagedResponse<AuditLogEntryResponse>>> ListAuditLogAsync(
        UserAdministrationService users,
        CancellationToken cancellationToken,
        Guid? userId = null,
        string? action = null,
        int page = 1,
        int pageSize = 50) =>
        TypedResults.Ok(await users.ListAuditLogAsync(userId, action, page, pageSize, cancellationToken));
}
