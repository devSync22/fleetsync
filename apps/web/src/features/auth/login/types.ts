/** Payload the login form submits; should match the backend login endpoint's request body. */
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
