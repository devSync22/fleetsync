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
