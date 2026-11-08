/** Route objects for the trip screens, so other features don't hard-code the paths. */

export function tripHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]', params: { tripId } } as const;
}

/** Start trip — a placeholder until the trip-flow branch (feature 4). */
export function tripStartHref(tripId: string) {
  return { pathname: '/driver/trip/[tripId]/start', params: { tripId } } as const;
}
