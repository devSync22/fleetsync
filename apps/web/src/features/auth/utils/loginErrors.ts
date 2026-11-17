import { formatTime } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { LoginError } from '../types'

/** Account lockout policy shown to users. Matches the API's Auth:Lockout settings. */
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

/** Turns a failed sign-in (API `errorCode`) into what the login form shows. */
export function toLoginError(error: ApiError): LoginError {
  switch (error.errorCode) {
    case 'auth.invalid_credentials': {
      const attemptsLeft = error.extensions.attemptsLeft
      return invalidCredentialsError(typeof attemptsLeft === 'number' ? attemptsLeft : undefined)
    }
    case 'auth.locked_out': {
      const lockoutEnd = error.extensions.lockoutEnd
      const until = typeof lockoutEnd === 'string' ? ` after ${formatTime(new Date(lockoutEnd))}` : ' later'
      return {
        title: 'Account temporarily locked',
        message: `Too many failed attempts. Try again${until}, or reset your password.`,
      }
    }
    // email_not_verified, pending_approval, account_disabled, network errors…:
    // the API's own title and detail are written for users.
    default:
      return { title: error.title, message: error.detail }
  }
}

/** "1 attempt left" / "2 attempts left" — text for the password field helper. */
export function formatAttemptsLeft(attemptsLeft: number): string {
  return `${attemptsLeft} ${attemptsLeft === 1 ? 'attempt' : 'attempts'} left`
}
