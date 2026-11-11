/**
 * Payload for creating a customer (company) account — Figma "Auth — Customer registration".
 * "Confirm password" and the terms checkbox are checked on the client and not sent.
 * Should match the backend registration endpoint's request body once it exists.
 */
export type CustomerRegistrationRequest = {
  companyName: string
  businessRegistrationNo: string
  billingAddress: string
  /** Contact person's full name. */
  fullName: string
  mobile: string
  /** Work email; the customer signs in with it. */
  email: string
  password: string
}

/** Staff roles a person can apply for (customers register separately; admin/owner are assigned). */
export type StaffRole = 'driver' | 'mechanic' | 'coordinator'

/**
 * The application form a Fleet Administrator generated for an applicant
 * (shown in the info banner, e.g. "Application form APP-2026-0124").
 */
export type StaffApplicationFormInfo = {
  /** Human-readable form code, e.g. "APP-2026-0124". */
  code: string
  /** Last day the form can be submitted, as an ISO date (e.g. "2026-10-26"). */
  expiresOn: string
}

/**
 * Payload for "Auth — Staff account application". Sent as multipart form data
 * because it includes documents. Should match the backend endpoint once it exists.
 */
export type StaffApplicationRequest = {
  /** Code of the admin-generated form this application belongs to, when known. */
  applicationFormCode?: string
  fullName: string
  /** Sri Lankan National Identity Card number (old 9 digits + V/X, or new 12 digits). */
  nic: string
  email: string
  mobile: string
  role: StaffRole
  /** NIC copy, driving licence, etc. (PDF or JPG, up to 5 MB each). */
  documents: File[]
}

/**
 * What the "Registration submitted" screen shows after a customer registration
 * or staff application is sent (Figma "Auth — Registration submitted").
 */
export type RegistrationSubmission = {
  /** Reference number issued by the server, e.g. "REG-2026-0142". Unknown until the API exists. */
  reference?: string
  /** Used in "Thanks, <first name>." */
  firstName: string
  /** Sign-in email the verification link was sent to. */
  email: string
  /** Summary line, e.g. "Customer · Hayleys Freight (Pvt) Ltd" or "Staff · Driver". */
  accountType: string
  submittedAt: Date
}
