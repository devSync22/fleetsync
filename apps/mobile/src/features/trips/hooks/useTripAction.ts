import { useState } from 'react';

import { TripCancelledError } from '../services/tripsApi';

export type TripActionState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

/**
 * Runs one trip step (start, pickup, note, complete). While it runs the state is `submitting`; on failure
 * the message is kept for an error banner and what the driver entered stays on screen.
 * If the coordinator cancelled the trip, `onCancelled` runs (screens reload the trip to show it).
 */
export function useTripAction<T>(action: () => Promise<T>, onSuccess: (result: T) => void, onCancelled: () => void) {
  const [state, setState] = useState<TripActionState>({ kind: 'idle' });

  function run() {
    if (state.kind === 'submitting') return;
    setState({ kind: 'submitting' });
    action()
      .then((result) => {
        setState({ kind: 'idle' });
        onSuccess(result);
      })
      .catch((error: unknown) => {
        if (error instanceof TripCancelledError) {
          setState({ kind: 'idle' });
          onCancelled();
          return;
        }
        setState({
          kind: 'error',
          message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        });
      });
  }

  return { state, run };
}
