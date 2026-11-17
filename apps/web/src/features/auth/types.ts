/**
 * Types for the auth feature. Request shapes match the FleetSync API
 * (apps/api, `/api/auth/*`); see its OpenAPI document at /scalar in development.
 */

/** POST /api/auth/login */
export type LoginRequest = {
  email: string
  password: string
  rememberMe: boolean
}

/**
 * A failed sign-in, as shown on the form (Figma frame "Login — error").
 * `title`/`message` fill the danger banner; `attemptsLeft`, when known,
 * is shown under the password field.
 */
export type LoginError = {
  title: string
  message: string
  attemptsLeft?: number
}

/**
 * POST /api/auth/register/customer — Figma "Auth — Customer registration".
 * "Confirm password" and the terms checkbox are checked on the client and not sent.
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

/** Staff roles a person can apply for on the web form (customers register separately; admins are assigned). */
export type StaffRole = 'driver' | 'mechanic' | 'coordinator'

/** Sri Lankan driving licence groups, as the API names them. */
export type LicenceClass = 'light' | 'light-lorry' | 'heavy' | 'heavy-trailer'

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
 * POST /api/auth/staff-applications — Figma "Auth — Staff account application".
 * Sent as multipart form data because it includes documents.
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
  /** Drivers only (required by the API). */
  licenceNumber?: string
  /** Drivers only (required by the API). */
  licenceClass?: LicenceClass
  /** NIC copy, driving licence, etc. (PDF or JPG, up to 5 MB each). */
  documents: File[]
}

/** Response of both sign-up endpoints: fills the "Registration submitted" screen. */
export type RegistrationSubmittedResponse = {
  /** e.g. "REG-2026-0142" */
  reference: string
  email: string
  submittedAt: string
}

/**
 * What the "Registration submitted" screen shows after a customer registration
 * or staff application (Figma "Auth — Registration submitted").
 */
export type RegistrationSubmission = {
  /** Customers verify their email next; staff wait for review, then get an activation link. */
  kind: 'customer' | 'staff'
  /** Reference number issued by the server, e.g. "REG-2026-0142". */
  reference: string
  /** Used in "Thanks, <first name>." */
  firstName: string
  /** Sign-in email. */
  email: string
  /** Summary line, e.g. "Customer · Hayleys Freight (Pvt) Ltd" or "Staff · Driver". */
  accountType: string
  submittedAt: Date
}

/** POST /api/auth/reset-password/lookup → the account the reset link belongs to. */
export type ResetPasswordLookupResponse = {
  email: string
}
