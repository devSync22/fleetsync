/**
 * Password policy from the Figma "Auth — Set new password" screen.
 * These are the rules the browser can check; "not the same as your last
 * password" can only be checked by the server, so it isn't listed here.
 * Keep in sync with the backend's password validation once it exists.
 */
export const passwordRules = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'case',
    label: 'One uppercase and one lowercase letter',
    test: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number',
    test: (password: string) => /[0-9]/.test(password),
  },
] as const

/** True when the password passes every client-side rule above. */
export function meetsPasswordRules(password: string) {
  return passwordRules.every((rule) => rule.test(password))
}

/** 0 = nothing typed, 1–2 = weak/fair (red), 3–4 = strong/very strong (green). */
export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: string
}

const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Very strong'] as const

/**
 * Score for the 4-bar meter: one bar per rule met, plus a fourth bar when all
 * rules pass and the password also contains a symbol (e.g. "!", "#").
 * In the design a 12-character password meeting every rule shows 3 bars,
 * "Strong", which this reproduces.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) return { score: 0, label: '' }

  const rulesMet = passwordRules.filter((rule) => rule.test(password)).length
  const hasSymbol = /[^A-Za-z0-9]/.test(password)
  // Even a single character shows one (red) bar so the meter visibly reacts to typing.
  const score = Math.max(1, rulesMet + (rulesMet === passwordRules.length && hasSymbol ? 1 : 0))

  return {
    score: score as PasswordStrength['score'],
    label: strengthLabels[score],
  }
}
