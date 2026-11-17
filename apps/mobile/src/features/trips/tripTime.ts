import type { Trip } from './types';

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
