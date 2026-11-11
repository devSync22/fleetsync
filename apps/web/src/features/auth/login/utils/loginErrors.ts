import type { LoginError } from '../types'

/**
 * Account lockout policy shown to users. Keep in sync with the backend's
 * lockout settings once the login endpoint exists.
 */
export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 15

/**
 * Builds the error shown for a wrong email/password combination.
 * The message deliberately doesn't say which of the two was wrong,
 * so the form can't be used to discover registered emails.
 */
export function invalidCredentialsError(attemptsLeft?: number): LoginError {
  return {
    title: 'Incorrect email or password',
    message: `Check your details and try again. After ${MAX_LOGIN_ATTEMPTS} failed attempts the account is locked for ${LOCKOUT_MINUTES} minutes.`,
    attemptsLeft,
  }
}

/** "1 attempt left" / "2 attempts left" — text for the password field helper. */
export function formatAttemptsLeft(attemptsLeft: number): string {
  return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`
}
