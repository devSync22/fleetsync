/** Payload the login form submits; should match the backend login endpoint's request body. */
export type LoginRequest = {
  email: string
  password: string
  rememberMe: boolean
}

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
