import type { CargoCondition } from './types';

/** "2 of 3 added" (Driver — Proof of delivery). */
export const MAX_POD_PHOTOS = 3;

export const CARGO_CONDITIONS: readonly CargoCondition[] = ['All received', 'Some missing', 'Damaged'];

export const RECIPIENT_NAME_MAX_LENGTH = 80;
export const POD_NOTES_MAX_LENGTH = 500;

/** Odometers show up to 7 digits (9,999,999 km). */
export const ODOMETER_MAX_DIGITS = 7;
