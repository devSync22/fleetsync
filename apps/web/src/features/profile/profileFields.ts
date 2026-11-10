import type { ProfileField } from './types'

export const fieldLabels: Record<ProfileField, string> = {
  fullName: 'Full name',
  workEmail: 'Work email',
  mobile: 'Mobile',
  officePhone: 'Office phone',
  address: 'Address',
}

/** Password rules from the "Change password" card, checked as the user types. */
export const passwordRules = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
  { id: 'capital', label: 'One capital letter', test: (p: string) => /[A-Z]/.test(p) },
] as const
