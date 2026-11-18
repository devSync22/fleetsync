import type { MobileRole } from '../shared/types'

/**
 * What an admin approved, shown on "Mobile — Account approved"
 * (POST /api/auth/activation/lookup with the token from the approval email link).
 */
export type AccountApproval = {
  firstName: string
  role: MobileRole
  /** Staff ID, e.g. "DRV-036" for drivers. Null until staff management assigns one. */
  staffId: string | null
  /** Null until staff management assigns one. */
  depot: string | null
  /** The company email the account signs in with. */
  signInEmail: string
  /** e.g. "Ayesha · Fleet Administrator". */
  approvedBy: string
  /** ISO dates for the Sent → Reviewed → Approved progress strip. */
  sentAt: string
  reviewedAt: string
  approvedAt: string
}
