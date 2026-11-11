/** Sri Lankan NIC: old format (9 digits + V or X) or new format (12 digits). */
export function isValidNic(nic: string) {
  return /^([0-9]{9}[VvXx]|[0-9]{12})$/.test(nic.trim())
}

/** Simple email check (something@something.tld); the server does the real validation. */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Sri Lankan mobile: 10 digits starting with 07 (spaces allowed), or +94 7X… */
export function isValidMobile(mobile: string) {
  const digits = mobile.replace(/[\s-]/g, '')
  return /^(07[0-9]{8}|\+947[0-9]{8})$/.test(digits)
}

/**
 * Password rules from the "Mobile — Account approved" design. Note these are
 * slightly different from the website's rules (which also require a lowercase
 * letter); keep both in sync with the backend policy once it exists.
 */
export const mobilePasswordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'number', label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { id: 'capital', label: 'One capital letter', test: (p: string) => /[A-Z]/.test(p) },
] as const

export function meetsMobilePasswordRules(password: string) {
  return mobilePasswordRules.every((rule) => rule.test(password))
}

/** "Tharindu Wijesinghe" → "Tharindu", for "Thanks, <first name>." */
export function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? ''
}
