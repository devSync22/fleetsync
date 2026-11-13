import { formatDate, formatDistance, formatTime } from '@/lib/format';

import { isSameDay } from './tripStatus';
import type { Trip } from './types';

export type TripGroup = { title: string; trips: Trip[] };

const DAY_MS = 24 * 60 * 60 * 1000;

/** "Colombo 10 → Negombo". */
export function tripRouteLabel(trip: Trip): string {
  return `${trip.pickup.area} → ${trip.destination.area}`;
}

/**
 * Row subtitle: "TRP-2208 · 09:41 – 11:22" for a trip finished today, "TRP-2199 · Fri 17 Oct" for an
 * earlier day, "TRP-2207 · Thu 16 Nov · 07:00" for an upcoming trip.
 */
export function tripRowSubtitle(trip: Trip, now: Date): string {
  const finished = trip.status === 'Completed' || trip.status === 'Cancelled';
  if (!finished) return `${trip.id} · ${formatDate(trip.scheduledStart, 'short')} · ${formatTime(trip.scheduledStart)}`;
  if (isSameDay(trip.scheduledStart, now)) {
    const start = trip.startedAt ?? trip.scheduledStart;
    const end = trip.completedAt ?? trip.deliverBy;
    return `${trip.id} · ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${trip.id} · ${formatDate(trip.scheduledStart, 'short')}`;
}

/** Distance on the right of a row; a cancelled trip shows "—". */
export function tripRowDistance(trip: Trip): string {
  return trip.status === 'Cancelled' ? '—' : formatDistance(trip.distanceKm);
}

/** History groups as in the frame: Today, This week (last 7 days), then Earlier. Empty groups are left out. */
export function groupTripHistory(trips: Trip[], now: Date): TripGroup[] {
  const groups: TripGroup[] = [
    { title: 'Today', trips: [] },
    { title: 'This week', trips: [] },
    { title: 'Earlier', trips: [] },
  ];
  for (const trip of trips) {
    const age = now.getTime() - new Date(trip.scheduledStart).getTime();
    const index = isSameDay(trip.scheduledStart, now) ? 0 : age <= 7 * DAY_MS ? 1 : 2;
    groups[index].trips.push(trip);
  }
  return groups.filter((group) => group.trips.length > 0);
}

/** Summary tiles: trips completed this month, their distance, and issues reported on this month's trips. */
export function monthSummary(trips: Trip[], now: Date) {
  const thisMonth = trips.filter((trip) => {
    const date = new Date(trip.scheduledStart);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const completed = thisMonth.filter((trip) => trip.status === 'Completed');
  return {
    tripCount: completed.length,
    distanceKm: completed.reduce((sum, trip) => sum + trip.distanceKm, 0),
    issueCount: thisMonth.reduce((sum, trip) => sum + trip.issueCount, 0),
  };
}
