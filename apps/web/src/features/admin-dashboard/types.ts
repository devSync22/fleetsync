import type { DomainStatus } from '@/components/shared/statusTones'

/** One pending row of the "Account applications" card. */
export type PendingApplication = {
  applicationId: string
  name: string
  email: string
  /** Staff apply for themselves; companies register as customers. */
  type: 'Staff' | 'Company'
  requestedRole: string
  submittedLabel: string
}

export type RoleCount = { label: string; count: number }

export type PendingChangeRequest = {
  requestId: string
  /** "K. Perera · Driver" */
  who: string
  /** "Mobile number" */
  field: string
}

export type AuditEvent = {
  eventId: string
  time: string
  userName: string
  userRole: string
  action: string
  /** The affected record (trip, user, plate, email or role). */
  record: string
  result: Extract<DomainStatus, 'success' | 'applied' | 'failed' | 'changed'>
}

export type AdminDashboard = {
  adminFirstName: string
  activeUsers: number
  deactivatedUsers: number
  pendingApplications: PendingApplication[]
  oldestApplicationWait: string
  changeRequests: PendingChangeRequest[]
  auditEventsToday: number
  lastAuditEventAt: string
  usersByRole: RoleCount[]
  recentAudit: AuditEvent[]
  /** Product updates shown in the "What's new" ticker. */
  whatsNew: string[]
}
