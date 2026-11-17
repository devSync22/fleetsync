import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TripNotFoundError, getTrip } from '../services/tripsApi';
import type { Trip } from '../types';

export type TripState =
  | { kind: 'loading' }
  | { kind: 'loaded'; trip: Trip; checkedAt: Date }
  | { kind: 'notFound' }
  | { kind: 'error'; message: string };

/**
 * Loads one trip, with retry. `checkedAt` is the time used for "Today" / can-start checks.
 * When the screen comes back into focus (e.g. after completing the trip) it reloads quietly:
 * the current trip stays on screen and a failed quiet reload is ignored.
 */
export function useTrip(tripId: string | undefined) {
  const [state, setState] = useState<TripState>({ kind: 'loading' });
  // A new object starts a load; `quiet` loads keep the current state on failure.
  const [request, setRequest] = useState({ quiet: false });

  useEffect(() => {
    let cancelled = false;
    // A missing ID resolves as "not found" through the service, like any unknown ID.
    getTrip(tripId ?? '')
      .then((trip) => {
        if (!cancelled) setState({ kind: 'loaded', trip, checkedAt: new Date() });
      })
      .catch((error: unknown) => {
        if (cancelled || request.quiet) return;
        if (error instanceof TripNotFoundError) {
          setState({ kind: 'notFound' });
        } else {
          setState({ kind: 'error', message: error instanceof Error ? error.message : 'Couldn’t load this trip.' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tripId, request]);

  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setRequest({ quiet: true });
    }, []),
  );

  function retry() {
    setState({ kind: 'loading' });
    setRequest({ quiet: false });
  }

  return { state, retry };
}
