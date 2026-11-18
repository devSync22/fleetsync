import type { Paged } from '@/lib/paging'

export type AuditResult = 'success' | 'failed'

export type AuditModule =
  | 'Trips'
  | 'Users'
  | 'Auth'
  | 'Maintenance'
  | 'Roles'
  | 'Orders'
  | 'Payments'
  | 'Applications'
  | 'Vehicles'
  | 'Reference data'

/** One before → after pair shown under "Changes". */
export type AuditChange = { field: string; before: string; after: string }

export type AuditEvent = {
  eventId: string
  /** ISO timestamp. */
  at: string
  userName: string
  /** "Coordinator", "Administrator", "Authentication" (for System). */
  userRole: string
  /** Signed-in user's ID; null for System events. */
  userId: string | null
  action: string
  module: AuditModule
  /** Affected record: "TRP-2026-00392", "USR-0071", an email… */
  record: string
  /** Human label for the record when it is a person ("Sanduni Fernando"). */
  recordLabel: string | null
  /** Linked user account, for "View user". */
  recordUserId: string | null
  result: AuditResult
  changes: AuditChange[]
  reason: string | null
  ipAddress: string
  device: string
  sessionId: string
}

export type AuditPeriod = 'today' | '24h' | '7d' | '30d'

export type AuditQuery = {
  search: string
  period: AuditPeriod
  user: string
  module: AuditModule | 'all'
  result: AuditResult | 'all'
  page: number
}

export type AuditPage = Paged<AuditEvent> & {
  /** Everyone who appears in the log, for the "All users" filter. */
  users: string[]
}

export type ExportFormat = 'pdf' | 'excel' | 'csv'

export type ExportRequest = {
  from: string
  to: string
  format: ExportFormat
  includeChanges: boolean
  includeDevice: boolean
  filters: Omit<AuditQuery, 'page' | 'period' | 'search'>
}
