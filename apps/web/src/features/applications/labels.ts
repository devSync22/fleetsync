import type { ApplicantType, ApplicationTab, RequestedRole } from './types'

/** Role names as the Applications frames write them. */
export const requestedRoleLabels: Record<RequestedRole, string> = {
  customer: 'Customer',
  driver: 'Driver',
  mechanic: 'Mechanic',
  coordinator: 'Operational Coordinator',
}

export const applicantTypeLabels: Record<ApplicantType, string> = { staff: 'Staff', company: 'Company' }

export const applicationTabs: { id: ApplicationTab; label: string }[] = [
  { id: 'open', label: 'Open' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

export const isApplicationTab = (value: string): value is ApplicationTab => applicationTabs.some((t) => t.id === value)
