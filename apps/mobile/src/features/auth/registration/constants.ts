import type { LicenceClass } from './types'

/**
 * Options for the "Licence class" dropdown. The design only shows "Heavy vehicle";
 * these follow the Sri Lankan licence groups. TODO: confirm the final list.
 */
export const licenceClassOptions: { value: LicenceClass; label: string }[] = [
  { value: 'light', label: 'Light vehicle (B)' },
  { value: 'light-lorry', label: 'Light lorry (C1)' },
  { value: 'heavy', label: 'Heavy vehicle (C)' },
  { value: 'heavy-trailer', label: 'Heavy vehicle + trailer (CE)' },
]

/** Document rules from the design: PDF or JPG, up to 5 MB each. */
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg']
export const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024
