const SIX_MONTHS_MS = 182 * 24 * 60 * 60 * 1000

/** Licence expiry rule: must be valid for more than 6 months at approval. */
export function expiryProblem(expiry: string): string | null {
  if (!expiry) return 'Enter the licence expiry date'
  const date = new Date(expiry)
  if (Number.isNaN(date.getTime())) return 'Enter a valid date'
  if (date.getTime() <= Date.now()) return 'This licence has expired'
  if (date.getTime() - Date.now() < SIX_MONTHS_MS) return 'Must be valid for more than 6 months'
  return null
}
