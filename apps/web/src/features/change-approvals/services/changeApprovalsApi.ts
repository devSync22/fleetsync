import { ApiError } from '@/services/apiClient'
import { mockRequest, nowTime } from '@/services/mockRequest'
import { changeRequestsMock } from '../mocks/changeRequestsMock'
import type { ChangeRequest, ChangeRequestsResult, ChangeRequestStatus } from '../types'

/*
 * Mocked until wired to the Auth module endpoints (see docs/runbooks/auth-module.md):
 *   getChangeRequests    → apiClient.get('/profile-change-requests', { params: { status } })
 *   approveChangeRequest → apiClient.post(`/profile-change-requests/${id}/approve`)
 *   rejectChangeRequest  → apiClient.post(`/profile-change-requests/${id}/reject`, { reason })
 * Marking the proof as checked has no endpoint yet. Decisions are kept in memory for the session.
 * In dev, `?mock=error` / `?mock=empty` preview those states.
 */

const ADMIN = { userId: 'USR-0002', name: 'Ayesha Silva' }
const requests: ChangeRequest[] = structuredClone(changeRequestsMock)

function find(requestId: string) {
  const request = requests.find((r) => r.requestId === requestId)
  if (!request) throw new ApiError(`Change request ${requestId} was not found.`, 404)
  return request
}

function assertReviewable(request: ChangeRequest) {
  if (request.status !== 'pending') throw new ApiError('This request has already been decided.', 409)
  // Same rule as the API (profile_change.self_review): admins can't approve their own changes.
  if (request.userId === ADMIN.userId) throw new ApiError('You can’t review a change to your own profile.', 403)
}

export async function getChangeRequests(status: ChangeRequestStatus): Promise<ChangeRequestsResult> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : requests
  return {
    // Newest first, as in the frame.
    requests: structuredClone(source.filter((r) => r.status === status)),
    counts: {
      pending: source.filter((r) => r.status === 'pending').length,
      approved: source.filter((r) => r.status === 'approved').length,
      rejected: source.filter((r) => r.status === 'rejected').length,
    },
  }
}

export async function markProofChecked(requestId: string): Promise<ChangeRequest> {
  await mockRequest()
  const request = find(requestId)
  if (request.proof) request.proof.checked = true
  return structuredClone(request)
}

export async function approveChangeRequest(requestId: string): Promise<ChangeRequest> {
  await mockRequest()
  const request = find(requestId)
  assertReviewable(request)
  if (request.proof && !request.proof.checked) throw new ApiError('Check the attached document before approving.', 409)
  Object.assign(request, { status: 'approved', decidedAt: `Today, ${nowTime()}`, decidedBy: ADMIN.name })
  return structuredClone(request)
}

export async function rejectChangeRequest(requestId: string, reason: string): Promise<ChangeRequest> {
  await mockRequest()
  const request = find(requestId)
  assertReviewable(request)
  if (!reason.trim()) throw new ApiError('Give the user a reason.', 422)
  Object.assign(request, { status: 'rejected', decidedAt: `Today, ${nowTime()}`, decidedBy: ADMIN.name, rejectReason: reason.trim() })
  return structuredClone(request)
}
