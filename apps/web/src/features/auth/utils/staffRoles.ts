import type { LicenceClass, StaffRole } from '../types'

/** Display names for staff roles, used by the application form and confirmation screen. */
export const staffRoleLabels: Record<StaffRole, string> = {
  driver: 'Driver',
  mechanic: 'Mechanic',
  coordinator: 'Coordinator',
}

/** Display names for driving licence classes (same groups as the mobile app). */
export const licenceClassLabels: Record<LicenceClass, string> = {
  light: 'Light vehicle',
  'light-lorry': 'Light lorry',
  heavy: 'Heavy vehicle',
  'heavy-trailer': 'Heavy vehicle with trailer',
}
