import type { Trip } from './types';

/** Route objects for the trip screens, so other features don't hard-code the paths. */

export function tripHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]', params: { tripId } } as const;
}

/** Trip details opened from the Trips tab, so the driver stays on that tab. */
export function tripsTabTripHref(tripId: string) {
  return { pathname: '/driver/trips/[tripId]', params: { tripId } } as const;
}

/** Driver — Start trip: starting odometer. */
export function tripStartHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/start', params: { tripId } } as const;
}

/** Driver — Active trip (to pickup / in progress — one screen, two states). */
export function activeTripHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/active', params: { tripId } } as const;
}

/** Driver — Cargo picked up: confirm the load at the pickup. */
export function pickedUpHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/picked-up', params: { tripId } } as const;
}

/** Driver — Report vehicle issue (vehicle-issues feature), during an active trip. */
export function reportIssueHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/report-issue', params: { tripId } } as const;
}

/** Driver — Proof of delivery: photos, receiver, cargo condition, signature, notes. */
export function proofOfDeliveryHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/proof-of-delivery', params: { tripId } } as const;
}

/** Driver — Complete trip: ending odometer once the proof of delivery is sent. */
export function completeTripHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/complete', params: { tripId } } as const;
}

/**
 * Where the driver continues a trip, from its status: Active trip while started or picked up,
 * Complete trip once delivered, otherwise Trip details. Used by "Continue trip" and on app resume.
 */
export function tripStepHref(trip: Trip) {
  switch (trip.status) {
    case 'Started':
    case 'Picked up':
    case 'In progress':
      return activeTripHref(trip.id);
    case 'Delivered':
      return completeTripHref(trip.id);
    default:
      return tripHref(trip.id);
  }
}
