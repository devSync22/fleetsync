/** Roles that can request an account in the mobile app (other roles use the website). */
export type MobileRole = 'driver' | 'mechanic'

/** Sri Lankan driving licence groups a driver can hold (TODO: confirm the list with the business). */
export type LicenceClass = 'light' | 'light-lorry' | 'heavy' | 'heavy-trailer'

/** A document picked from files or taken with the camera, not yet uploaded. */
export type PickedDocument = {
  /** Local file URI from the picker/camera, used for the upload. */
  uri: string
  name: string
  /** Size in bytes, when the picker reports it. */
  size?: number
  mimeType?: string
}

/**
 * Payload for "Mobile — Request account (Driver & Mechanic)".
 * Should match the backend's staff application endpoint once it exists.
 */
export type AccountRequest = {
  role: MobileRole
  fullName: string
  /** Sri Lankan NIC: 9 digits + V/X, or 12 digits. */
  nic: string
  email: string
  mobile: string
  /** Driver-only fields; omitted for mechanics. */
  licenceNumber?: string
  licenceClass?: LicenceClass
  /** NIC copy, driving licence… (PDF or JPG, up to 5 MB each). */
  documents: PickedDocument[]
}

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
