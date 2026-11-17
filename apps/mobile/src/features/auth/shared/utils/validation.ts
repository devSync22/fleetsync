/** Simple email check (something@something.tld); the server does the real validation. */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
