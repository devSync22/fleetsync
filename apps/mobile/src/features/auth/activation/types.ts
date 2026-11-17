import type { MobileRole } from '../shared/types'

/**
 * What an admin approved, shown on "Mobile — Account approved"
 * (loaded from the approval email link once the backend exists).
 */
export type AccountApproval = {
  firstName: string
  role: MobileRole
  /** Staff ID, e.g. "DRV-036" for drivers. */
  staffId: string
  depot: string
  /** The company email the account signs in with. */
  signInEmail: string
  /** e.g. "Ayesha · Fleet Administrator". */
  approvedBy: string
  /** ISO dates for the Sent → Reviewed → Approved progress strip. */
  sentAt: string
  reviewedAt: string
  approvedAt: string
}
