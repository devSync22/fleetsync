import type { AuditModule, AuditPeriod } from './types'

/** "Today, 19 Oct" style label for the period filter. */
export function periodOptions(now = new Date()): { id: AuditPeriod; label: string }[] {
  const today = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return [
    { id: 'today', label: `Today, ${today}` },
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
  ]
}

export const auditModules: AuditModule[] = ['Applications', 'Auth', 'Maintenance', 'Orders', 'Payments', 'Reference data', 'Roles', 'Trips', 'Users', 'Vehicles']

/** Module names as the details panel writes them ("Users" → "User accounts"). */
export const moduleLongNames: Partial<Record<AuditModule, string>> = {
  Users: 'User accounts',
  Auth: 'Sign-in and security',
  Roles: 'Roles & permissions',
}
