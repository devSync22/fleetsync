import type { Trip, TripStatus } from './types';

/**
 * The one place for trip status rules. Screens ask these functions what a trip allows instead of
 * comparing statuses themselves.
 */

type DateInput = Date | string;

function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

/** True when both values fall on the same calendar day (device time zone). */
export function isSameDay(a: DateInput, b: DateInput): boolean {
  const first = toDate(a);
  const second = toDate(b);
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

/** The trip is scheduled for the same day as `now`. */
export function isScheduledToday(trip: Trip, now: Date): boolean {
  return isSameDay(trip.scheduledStart, now);
}

/** Still Assigned after its start time has passed → show "Your trip was due to start at …". */
export function isLateToStart(trip: Trip, now: Date): boolean {
  return trip.status === 'Assigned' && toDate(trip.scheduledStart).getTime() < now.getTime();
}

/** The driver can start a trip that is Assigned and scheduled for today. */
export function canStartTrip(trip: Trip, now: Date): boolean {
  return trip.status === 'Assigned' && isScheduledToday(trip, now);
}

const ACTIVE_STATUSES: readonly TripStatus[] = ['Started', 'Picked up', 'In progress', 'Delivered'];

/** Started and not yet Completed or Cancelled — the driver continues it in the trip flow. */
export function isActiveTrip(trip: Trip): boolean {
  return ACTIVE_STATUSES.includes(trip.status);
}

/** Cargo is on board and the driver is heading to the destination (proof of delivery comes next). */
export function isHeadingToDestination(trip: Trip): boolean {
  return trip.status === 'Picked up' || trip.status === 'In progress';
}

/**
 * Badge text. Started and Picked up show as "In progress", as on both Driver — Active trip frames;
 * the progress card shows the exact step.
 */
export function tripBadgeLabel(status: TripStatus): string {
  return status === 'Started' || status === 'Picked up' ? 'In progress' : status;
}
