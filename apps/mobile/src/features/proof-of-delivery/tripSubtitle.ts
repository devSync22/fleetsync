import type { Trip } from '@/features/trips';

/** Header subtitle on both screens: "TRP-2208 · City Hospital store, Negombo". */
export function podTripSubtitle(trip: Trip) {
  return `${trip.id} · ${trip.destination.shortName}, ${trip.destination.area}`;
}
