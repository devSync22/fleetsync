import type { MobileRole } from './types'

/** Display names for the two mobile roles (request sent, account approved…). */
export const roleLabels: Record<MobileRole, string> = {
  driver: 'Driver',
  mechanic: 'Mechanic',
}
