export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected'

/** One changed field: the value on the profile now and the value the user asked for. */
export type FieldChange = { field: string; current: string; proposed: string; mono?: boolean }

/** A document the user attached as proof (e.g. a renewed licence). */
export type ProofDocument = { fileName: string; meta: string; checked: boolean }

export type ChangeRequest = {
  requestId: string
  userId: string
  userName: string
  /** "Driver", "Customer"… */
  roleLabel: string
  isCompany: boolean
  submittedAt: string
  changes: FieldChange[]
  reason: string
  proof: ProofDocument | null
  status: ChangeRequestStatus
  decidedAt: string | null
  decidedBy: string | null
  /** Rejected: the reason sent to the user. */
  rejectReason: string | null
}

export type ChangeRequestsResult = {
  requests: ChangeRequest[]
  counts: Record<ChangeRequestStatus, number>
}
