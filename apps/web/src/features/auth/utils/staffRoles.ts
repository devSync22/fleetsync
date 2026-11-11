import type { StaffRole } from '../types/auth'

/** Display names for staff roles, used by the application form and confirmation screen. */
export const staffRoleLabels: Record<StaffRole, string> = {
  driver: 'Driver',
  mechanic: 'Mechanic',
  coordinator: 'Coordinator',
}
