import { formatDistance } from '@/lib/format';

export const HANDED_OVER_BY_MAX_LENGTH = 80;
export const SEAL_NUMBER_MAX_LENGTH = 20;
export const TRIP_NOTE_MAX_LENGTH = 500;
/** Loading photos on Cargo picked up. */
export const MAX_LOADING_PHOTOS = 3;

/** Starting odometer: required, whole km, at least the vehicle's last recorded reading. */
export function validateStartOdometer(digits: string, lastOdometerKm: number): string | undefined {
  if (!digits) return 'Enter the starting odometer reading.';
  const km = Number(digits);
  if (!Number.isInteger(km) || km <= 0) return 'Enter the reading as a whole number of km.';
  if (km < lastOdometerKm) {
    return `Must be at least ${formatDistance(lastOdometerKm)}, the vehicle’s last recorded reading.`;
  }
  return undefined;
}

/** "Handed over by" is required. */
export function validateHandedOverBy(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Enter who handed over the cargo.';
  if (name.length < 2) return 'Enter their full name.';
  return undefined;
}

/** Seal number is optional; when given, letters, digits and dashes only. */
export function validateSealNumber(value: string): string | undefined {
  const seal = value.trim();
  if (seal && !/^[A-Za-z0-9-]+$/.test(seal)) return 'Use letters, numbers and dashes only.';
  return undefined;
}

export function validateTripNote(value: string): string | undefined {
  if (!value.trim()) return 'Write a note first.';
  return undefined;
}
