import type { PickedPhoto } from '@/hooks/usePhotoPicker';
import { formatFullDate } from '@/lib/format';

/** Show the "Licence expiring" banner this many days before the expiry date. */
export const LICENCE_WARNING_DAYS = 30;

/** Front and back of the licence. */
export const RENEWAL_PHOTO_COUNT = 2;

const DAY_MS = 24 * 60 * 60 * 1000;
const TYPED_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** "2026-11-18" → local midnight on that day. */
export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Local date → "2026-11-18". */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whole days from today to `isoDate`: 0 = today, negative = already passed. */
export function daysUntil(isoDate: string, now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((parseIsoDate(isoDate).getTime() - today.getTime()) / DAY_MS);
}

export function isLicenceExpiring(expiresOn: string, now = new Date()): boolean {
  return daysUntil(expiresOn, now) <= LICENCE_WARNING_DAYS;
}

/** "DD/MM/YYYY" → "YYYY-MM-DD", or null when it isn't a real date (e.g. 31/02/2030). */
export function parseTypedDate(value: string): string | null {
  const match = TYPED_DATE.exec(value.trim());
  if (!match) return null;
  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);
  const isReal = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isReal ? toIsoDate(date) : null;
}

export type RenewalErrors = { photos?: string; expiry?: string };

/** Errors for the "Upload renewed licence" form. */
export function validateRenewal(
  photos: PickedPhoto[],
  typedExpiry: string,
  currentExpiresOn: string,
  now = new Date(),
): RenewalErrors {
  const newExpiresOn = parseTypedDate(typedExpiry);
  let expiry: string | undefined;
  if (!typedExpiry.trim()) expiry = 'Enter the expiry date from your new licence';
  else if (!newExpiresOn) expiry = 'Enter a real date as DD/MM/YYYY, e.g. 18/11/2034';
  else if (daysUntil(newExpiresOn, now) <= 0) expiry = 'The expiry date must be in the future';
  else if (newExpiresOn <= currentExpiresOn)
    expiry = `Must be later than your current expiry (${formatFullDate(parseIsoDate(currentExpiresOn))})`;

  return {
    photos: photos.length < RENEWAL_PHOTO_COUNT ? 'Add photos of the front and back of your licence' : undefined,
    expiry,
  };
}
