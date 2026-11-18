import { paginate, textMatches } from '@/lib/paging'
import { ApiError } from '@/services/apiClient'
import { mockRequest, nowTime } from '@/services/mockRequest'
import { applicantContacts, applicationsMock, depotsMock, licenceClassesMock, tharinduDetail } from '../mocks/applicationsMock'
import type {
  ApplicationDetail,
  ApplicationsPage,
  ApplicationsQuery,
  ApplicationSummary,
  ApplicationTab,
  ApprovalOptions,
  ApproveInput,
  RejectInput,
  RequestedRole,
} from '../types'

/*
 * Mocked until the endpoints are wired up. They exist in the Auth module (see docs/runbooks/auth-module.md):
 *   getApplications   → apiClient.get('/applications', { params: { status, role, page, pageSize } })
 *   getApplication    → apiClient.get<ApplicationDetail>(`/applications/${id}`)
 *   approveApplication→ apiClient.post(`/applications/${id}/approve`, input)
 *   rejectApplication → apiClient.post(`/applications/${id}/reject`, { reason, message, allowReapply })
 * The note, document checks and licence details have no endpoint yet.
 *
 * Decisions made in this session are kept in memory. In dev, `?mock=error` / `?mock=empty` preview those states.
 */

const ADMIN_NAME = 'Ayesha Silva'

const summaries: ApplicationSummary[] = applicationsMock.map((a) => ({ ...a }))
const details = new Map<string, ApplicationDetail>()

/** Next number per account prefix, continuing the IDs seen in the frames. */
const accountCounters: Record<RequestedRole, { prefix: string; next: number; width: number }> = {
  driver: { prefix: 'DRV', next: 36, width: 3 },
  mechanic: { prefix: 'MEC', next: 13, width: 3 },
  coordinator: { prefix: 'EMP', next: 162, width: 4 },
  customer: { prefix: 'CUS', next: 35, width: 4 },
}

function peekAccountId(role: RequestedRole) {
  const counter = accountCounters[role]
  return `${counter.prefix}-${String(counter.next).padStart(counter.width, '0')}`
}

/** Builds review details for an application the frames only list, from its row. */
function genericDetail(summary: ApplicationSummary): ApplicationDetail {
  const contact = applicantContacts[summary.applicationId]
  const isCompany = summary.type === 'company'
  const docs: ApplicationDetail['documents'] = isCompany
    ? [
        { name: 'Business registration certificate.pdf', meta: 'PDF · 880 KB', status: 'verified' },
        { name: 'Billing address proof.pdf', meta: 'PDF · 410 KB', status: 'verified' },
        { name: 'Authorised contact letter.pdf', meta: 'PDF · 260 KB', status: 'verified' },
      ]
    : [
        { name: 'NIC — front and back.pdf', meta: 'PDF · 1.1 MB', status: 'verified' },
        { name: 'Police clearance report.pdf', meta: 'PDF · 690 KB', status: 'verified' },
        { name: 'Trade certificate.pdf', meta: 'PDF · 520 KB', status: 'verified' },
      ]
  const missing = summary.documentsRequired - summary.documentsUploaded
  const documents = docs.slice(0, Math.max(0, docs.length - missing))
  const [day, time] = summary.submittedAt.split(', ')

  return {
    ...summary,
    fullName: summary.name,
    nic: isCompany ? null : '199008123456',
    email: contact?.email ?? `${summary.name.split(' ')[0].toLowerCase()}@example.lk`,
    mobile: contact?.mobile ?? '077 000 0000',
    address: contact?.address ?? '—',
    company: isCompany ? { brNumber: contact?.brNumber ?? 'PV 00000000', contactName: contact?.contactName ?? summary.name } : null,
    licencePhotos: summary.requestedRole === 'driver'
      ? [
          { side: 'Front', fileName: 'licence-front.jpg', size: '2.0 MB', url: null },
          { side: 'Back', fileName: 'licence-back.jpg', size: '1.9 MB', url: null },
        ]
      : [],
    licence: null,
    documents,
    checks: [
      { label: 'Email address verified', passed: true },
      { label: 'Mobile number verified', passed: true },
      { label: 'No duplicate account found', passed: summary.rejectReason !== 'Duplicate account' },
      ...(missing > 0 ? [{ label: `${missing} required document${missing > 1 ? 's' : ''} missing`, passed: false }] : []),
    ],
    timeline: [
      ...(summary.decidedAt
        ? [{ text: `${summary.status === 'approved' ? 'Approved' : 'Rejected'} by ${summary.decidedBy}`, time: summary.decidedAt, tone: summary.status === 'approved' ? ('success' as const) : ('danger' as const) }]
        : []),
      { text: 'Automatic checks completed', time: summary.submittedAt, tone: 'success' },
      { text: 'Application submitted', time: `${day}, ${time}`, tone: 'neutral' },
    ],
    internalNote: '',
  }
}

function detailFor(applicationId: string): ApplicationDetail {
  const summary = summaries.find((a) => a.applicationId === applicationId)
  if (!summary) throw new ApiError(`Application ${applicationId} was not found.`, 404)
  let detail = details.get(applicationId)
  if (!detail) {
    detail = applicationId === 'APP-2026-0118' ? { ...summary, ...tharinduDetail, documents: tharinduDetail.documents.map((d) => ({ ...d })) } : genericDetail(summary)
    details.set(applicationId, detail)
  }
  // Keep the list row and the detail in step after decisions.
  return Object.assign(detail, summary)
}

const inTab = (tab: ApplicationTab, a: ApplicationSummary) =>
  tab === 'all' || (tab === 'open' ? a.status === 'pending-review' : a.status === tab)

export async function getApplications(query: ApplicationsQuery): Promise<ApplicationsPage> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : summaries
  const tabCounts = {
    open: source.filter((a) => inTab('open', a)).length,
    approved: source.filter((a) => inTab('approved', a)).length,
    rejected: source.filter((a) => inTab('rejected', a)).length,
    all: source.length,
  }
  const rows = source.filter(
    (a) =>
      inTab(query.tab, a) &&
      (query.type === 'all' || a.type === query.type) &&
      (query.role === 'all' || a.requestedRole === query.role) &&
      (textMatches(a.name, query.search) || textMatches(a.applicationId, query.search)),
  )
  // The Open tab is a work queue, so it lists the oldest first; the other tabs list the newest first.
  if (query.tab === 'open') rows.reverse()
  // Mock: the oldest open application in the frames has waited 2 days.
  const oldestWaiting = tabCounts.open > 0 ? '2 days' : null
  return { ...paginate(rows, query.page), tabCounts, oldestWaiting }
}

export async function getApplication(applicationId: string): Promise<ApplicationDetail> {
  await mockRequest()
  return { ...detailFor(applicationId) }
}

export async function getApprovalOptions(applicationId: string): Promise<ApprovalOptions> {
  await mockRequest()
  const detail = detailFor(applicationId)
  return { accountId: peekAccountId(detail.requestedRole), depots: depotsMock, licenceClasses: licenceClassesMock }
}

function assertOpen(detail: ApplicationDetail) {
  if (detail.status !== 'pending-review') {
    throw new ApiError('This application has already been decided. Refresh to see the latest status.', 409)
  }
}

export async function approveApplication(applicationId: string, input: ApproveInput): Promise<ApplicationDetail> {
  await mockRequest()
  const detail = detailFor(applicationId)
  assertOpen(detail)
  if (input.role === 'driver' && !input.licence) {
    throw new ApiError('Enter the licence details before approving a driver.', 422)
  }
  const accountId = peekAccountId(input.role)
  accountCounters[input.role].next += 1
  const summary = summaries.find((a) => a.applicationId === applicationId)!
  Object.assign(summary, {
    status: 'approved',
    requestedRole: input.role,
    decidedAt: `Today, ${nowTime()}`,
    decidedBy: ADMIN_NAME,
    accountId,
  } satisfies Partial<ApplicationSummary>)
  detail.licence = input.licence
  detail.timeline.unshift({
    text: `Approved by ${ADMIN_NAME} · account ${accountId} created`,
    time: `Today, ${nowTime()}`,
    tone: 'success',
  })
  return { ...detailFor(applicationId) }
}

export async function rejectApplication(applicationId: string, input: RejectInput): Promise<ApplicationDetail> {
  await mockRequest()
  const detail = detailFor(applicationId)
  assertOpen(detail)
  const summary = summaries.find((a) => a.applicationId === applicationId)!
  Object.assign(summary, {
    status: 'rejected',
    decidedAt: `Today, ${nowTime()}`,
    decidedBy: ADMIN_NAME,
    rejectReason: input.reason,
  } satisfies Partial<ApplicationSummary>)
  detail.timeline.unshift({
    text: `Rejected by ${ADMIN_NAME} · ${input.reason}${input.allowReapply ? '' : ' · may not reapply'}`,
    time: `Today, ${nowTime()}`,
    tone: 'danger',
  })
  return { ...detailFor(applicationId) }
}

/** Marks a document as checked by hand (e.g. the medical certificate). */
export async function verifyDocument(applicationId: string, documentName: string): Promise<ApplicationDetail> {
  await mockRequest()
  const detail = detailFor(applicationId)
  const doc = detail.documents.find((d) => d.name === documentName)
  if (!doc) throw new ApiError('That document was not found.', 404)
  doc.status = 'verified'
  detail.timeline.unshift({ text: `${documentName} checked by ${ADMIN_NAME}`, time: `Today, ${nowTime()}`, tone: 'neutral' })
  return { ...detailFor(applicationId) }
}

export async function saveInternalNote(applicationId: string, note: string): Promise<ApplicationDetail> {
  await mockRequest()
  const detail = detailFor(applicationId)
  detail.internalNote = note
  return { ...detailFor(applicationId) }
}

/** Every application matching the filters (all pages), for the Export button. */
export async function getApplicationsForExport(query: Omit<ApplicationsQuery, 'page'>): Promise<ApplicationSummary[]> {
  const first = await getApplications({ ...query, page: 1 })
  const pages = await Promise.all(
    Array.from({ length: first.pageCount - 1 }, (_, i) => getApplications({ ...query, page: i + 2 })),
  )
  return [first, ...pages].flatMap((page) => page.items)
}
