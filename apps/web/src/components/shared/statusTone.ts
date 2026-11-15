/**
 * One colour per meaning (web guide, "Status badges"):
 * neutral = inactive / draft / off duty, pending = pending / due soon,
 * accent = assigned / quoted / scheduled, info = on trip / in progress,
 * success = active / completed / paid, danger = overdue / failed / suspended / cancelled.
 */
export type StatusTone = 'neutral' | 'pending' | 'accent' | 'info' | 'success' | 'danger'

/**
 * Domain status → tone, kept in this one place so every screen colours a
 * status the same way. Add statuses here as their screens are built.
 */
const statusTones: Record<string, StatusTone> = {
  // Accounts and applications
  pending: 'pending',
  approved: 'success',
  activated: 'success',
  active: 'success',
  rejected: 'danger',
  suspended: 'danger',
  inactive: 'neutral',
  // Shared lifecycle words
  draft: 'neutral',
  assigned: 'accent',
  quoted: 'accent',
  scheduled: 'accent',
  'in-progress': 'info',
  'on-trip': 'info',
  completed: 'success',
  paid: 'success',
  overdue: 'danger',
  failed: 'danger',
  cancelled: 'danger',
}

/** The tone for a domain status (kebab-case, as the API sends it); unknown statuses are neutral. */
export function statusTone(status: string): StatusTone {
  return statusTones[status] ?? 'neutral'
}
