import { useState } from 'react';

import { TripCancelledError } from '@/features/trips';

import { submitProofOfDelivery } from '../services/podApi';
import type { PodSubmission, PodSubmissionResult } from '../types';

type SubmitState = { kind: 'idle' } | { kind: 'submitting' } | { kind: 'error'; message: string };

/**
 * Submits the proof of delivery. On failure the draft stays as it is, so the driver can just try again.
 * If the coordinator cancelled the trip, `onCancelled` runs (the screen reloads the trip to show it).
 */
export function useSubmitPod(onSuccess: (result: PodSubmissionResult) => void, onCancelled: () => void) {
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  function submit(submission: PodSubmission) {
    if (state.kind === 'submitting') return;
    setState({ kind: 'submitting' });
    submitProofOfDelivery(submission)
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

  return { state, submit };
}
