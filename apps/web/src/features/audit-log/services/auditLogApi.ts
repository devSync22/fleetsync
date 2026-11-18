import { downloadCsv } from '@/lib/csv'
import { paginate, textMatches } from '@/lib/paging'
import { ApiError } from '@/services/apiClient'
import { mockRequest } from '@/services/mockRequest'
import { buildAuditEvents } from '../mocks/auditLogMock'
import type { AuditEvent, AuditPage, AuditPeriod, AuditQuery, ExportRequest } from '../types'

/*
 * Mocked until wired to the Auth module's audit endpoint (see docs/runbooks/auth-module.md):
 *   getAuditLog   → apiClient.get('/audit-log', { params: { userId, action, page, pageSize } })
 *   getAuditEvent → apiClient.get(`/audit-log/${eventId}`)
 *   exportAudit   → apiClient.post('/audit-log/export', request, { responseType: 'blob' })   (not built yet)
 * Records are read-only. In dev, `?mock=error` / `?mock=empty` preview those states.
 */

/** The log shows 10 events per page ("Showing 1–10 of 1,284 events today"). */
export const AUDIT_PAGE_SIZE = 10

const events = buildAuditEvents()

const DAY_MS = 24 * 60 * 60 * 1000

/** Earliest timestamp included by a period filter. */
function periodStart(period: AuditPeriod, now = new Date()): Date {
  if (period === 'today') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    return start
  }
  const days = period === '24h' ? 1 : period === '7d' ? 7 : 30
  return new Date(now.getTime() - days * DAY_MS)
}

function matchesFilters(e: AuditEvent, q: Omit<AuditQuery, 'page' | 'period'>) {
  return (
    (q.user === 'all' || e.userName === q.user) &&
    (q.module === 'all' || e.module === q.module) &&
    (q.result === 'all' || e.result === q.result) &&
    [e.userName, e.action, e.record, e.eventId].some((text) => textMatches(text, q.search))
  )
}

export async function getAuditLog(query: AuditQuery): Promise<AuditPage> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : events
  const since = periodStart(query.period).toISOString()
  const rows = source.filter((e) => e.at >= since && matchesFilters(e, query))
  return { ...paginate(rows, query.page, AUDIT_PAGE_SIZE), users: [...new Set(events.map((e) => e.userName))].sort() }
}

export async function getAuditEvent(eventId: string): Promise<AuditEvent> {
  await mockRequest()
  const event = events.find((e) => e.eventId === eventId)
  if (!event) throw new ApiError(`Audit event ${eventId} was not found.`, 404)
  return event
}

/** Events in a date range (inclusive, local days) that match the page filters. */
function eventsForExport(request: ExportRequest) {
  const from = new Date(`${request.from}T00:00:00`).toISOString()
  const to = new Date(`${request.to}T23:59:59.999`).toISOString()
  return events.filter((e) => e.at >= from && e.at <= to && matchesFilters(e, { ...request.filters, search: '' }))
}

/** Count and rough size shown in the Export dialog before downloading. */
export function estimateExport(request: ExportRequest) {
  const count = eventsForExport(request).length
  const bytesPerEvent = 110 + (request.includeChanges ? 60 : 0) + (request.includeDevice ? 50 : 0)
  return { count, kilobytes: Math.max(1, Math.round((count * bytesPerEvent) / 1024)) }
}

export function exportFileName(request: Pick<ExportRequest, 'from' | 'to' | 'format'>) {
  const extension = request.format === 'excel' ? 'xlsx' : request.format
  return `audit-report_${request.from}_to_${request.to}.${extension}`
}

/**
 * Downloads the report. CSV is built in the browser; PDF and Excel need the server export endpoint,
 * which doesn't exist yet, so those fail with a clear message instead of a fake file.
 */
export async function exportAuditLog(request: ExportRequest): Promise<{ count: number }> {
  await mockRequest()
  if (request.from > request.to) throw new ApiError('“From” must be on or before “To”.', 422)
  if (request.format !== 'csv') {
    throw new ApiError('PDF and Excel reports are made by the server, and that export isn’t available yet. Choose CSV for now.', 501)
  }
  const rows = eventsForExport(request)
  const header = ['Event ID', 'Time', 'User', 'Role', 'Action', 'Module', 'Record', 'Result']
  if (request.includeChanges) header.push('Changes', 'Reason')
  if (request.includeDevice) header.push('IP address', 'Device', 'Session')
  downloadCsv(
    exportFileName(request),
    header,
    rows.map((e) => [
      e.eventId,
      new Date(e.at).toLocaleString('en-GB'),
      e.userName,
      e.userRole,
      e.action,
      e.module,
      e.record,
      e.result,
      ...(request.includeChanges ? [e.changes.map((c) => `${c.field}: ${c.before} → ${c.after}`).join('; '), e.reason ?? ''] : []),
      ...(request.includeDevice ? [e.ipAddress, e.device, e.sessionId] : []),
    ]),
  )
  return { count: rows.length }
}
