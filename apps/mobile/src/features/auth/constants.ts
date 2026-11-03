import type { SelectOption } from '@/components/ui';

import type { LicenceClass, StaffRole } from './types';

export const ROLE_LABELS: Record<StaffRole, string> = {
  driver: 'Driver',
  mechanic: 'Mechanic',
};

export const STAFF_ID_LABELS: Record<StaffRole, string> = {
  driver: 'Driver ID',
  mechanic: 'Mechanic ID',
};

export const LICENCE_CLASS_OPTIONS: readonly SelectOption<LicenceClass>[] = [
  { value: 'light', label: 'Light vehicle' },
  { value: 'heavy', label: 'Heavy vehicle' },
];

/** Accepted upload types: "PDF or JPG · up to 5 MB each". */
export const DOCUMENT_MIME_TYPES = ['application/pdf', 'image/jpeg'] as const;
export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

/** Sign-in lockout rule from the "Login — error" frame. */
export const MAX_SIGN_IN_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
