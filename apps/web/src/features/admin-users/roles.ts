import type { Access, UserRole } from './types'

/** Label and one-line description of each role, as written on the Change role dialog (59:986). */
export const roleInfo: Record<UserRole, { label: string; description: string; short: string }> = {
  customer: { label: 'Customer', description: 'Places orders, accepts quotations, pays online', short: 'Customer' },
  driver: { label: 'Driver', description: 'Runs assigned trips, records odometer and notes', short: 'Driver' },
  mechanic: { label: 'Mechanic', description: 'Maintenance queue, service records, documents', short: 'Mechanic' },
  coordinator: { label: 'Operational Coordinator', description: 'Reviews orders, creates and assigns trips', short: 'Coordinator' },
  'fleet-administrator': { label: 'Fleet Administrator', description: 'Users, roles, reference data, audit log', short: 'Administrator' },
  owner: { label: 'Fleet Owner', description: 'Executive dashboards and reports', short: 'Fleet owner' },
}

/** Column / option order used on every admin screen. */
export const roleOrder: UserRole[] = ['customer', 'driver', 'mechanic', 'coordinator', 'fleet-administrator', 'owner']

/** Shorter descriptions used on the Create user role cards (109:2970). */
export const createRoleDescriptions: Record<Exclude<UserRole, 'customer'>, string> = {
  driver: 'Runs assigned trips, records odometer',
  mechanic: 'Maintenance queue and service records',
  coordinator: 'Orders, quotations and trips',
  'fleet-administrator': 'Users, roles, reference data, audit',
  owner: 'Dashboards, analysis and reports',
}

/** Badge text and tone for each access level on the Roles & permissions matrix. */
export const accessInfo: Record<Exclude<Access, 'none'>, { label: string; tone: 'success' | 'info' | 'neutral' }> = {
  full: { label: 'Full', tone: 'success' },
  own: { label: 'Own records', tone: 'info' },
  assigned: { label: 'Assigned only', tone: 'info' },
  report: { label: 'Report issues', tone: 'info' },
  view: { label: 'View only', tone: 'neutral' },
}
