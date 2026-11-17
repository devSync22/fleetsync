import { useEffect, useState } from 'react';

import { TripNotFoundError, getTrip } from '../services/tripsApi';
import type { Trip } from '../types';

type TripState =
  | { kind: 'loading' }
  | { kind: 'loaded'; trip: Trip; checkedAt: Date }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

/** Loads one trip for Trip details, with retry. `checkedAt` is the time used for "Today" / can-start checks. */
export function useTrip(tripId: string | undefined) {
  const [state, setState] = useState<TripState>({ kind: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // A missing ID resolves as "not found" through the service, like any unknown ID.
    getTrip(tripId ?? '')
      .then((trip) => {
        if (!cancelled) setState({ kind: 'loaded', trip, checkedAt: new Date() });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof TripNotFoundError) {
          setState({ kind: 'notFound' });
        } else {
          setState({ kind: 'error', message: error instanceof Error ? error.message : 'Couldn’t load this trip.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, reloadKey]);

  function retry() {
    setState({ kind: 'loading' });
    setReloadKey((key) => key + 1);
  }

  return { state, retry };
}
