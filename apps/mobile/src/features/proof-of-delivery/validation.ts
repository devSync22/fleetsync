import { formatDistance } from '@/lib/format';

import type { PodDraft } from './types';

/** "Received by" is required. */
export function validateRecipientName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Enter the name of the person who received the cargo.';
  if (name.length < 2) return 'Enter the receiver’s full name.';
  return undefined;
}

/** Proof of delivery screen: everything needed before Continue. Photos, signature and notes are optional. */
export function isPodDetailsValid(draft: PodDraft): boolean {
  return validateRecipientName(draft.recipientName) === undefined;
}

/** Ending odometer: required, whole km, more than the reading entered on Start trip. */
export function validateEndOdometer(digits: string, startOdometerKm: number | undefined): string | undefined {
  if (!digits) return 'Enter the ending odometer reading.';
  const km = Number(digits);
  if (!Number.isInteger(km) || km <= 0) return 'Enter the reading as a whole number of km.';
  if (startOdometerKm !== undefined && km <= startOdometerKm) {
    return `Must be more than ${formatDistance(startOdometerKm)}, the reading when the trip started.`;
  }
  return undefined;
}
