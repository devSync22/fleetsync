import { useLocalSearchParams } from 'expo-router';

import { canCompleteTrip, useTrip } from '@/features/trips';

import { CompleteTripForm } from '../components/CompleteTripForm';
import { PodTripGate } from '../components/PodTripGate';

/** Driver — Complete trip (Figma 173:6655). Opened with "Continue" on Proof of delivery. */
export function CompleteTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry } = useTrip(tripId);

  if (state.kind !== 'loaded' || !canCompleteTrip(state.trip)) {
    return <PodTripGate title="Complete trip" tripId={tripId} state={state} retry={retry} />;
  }
  return <CompleteTripForm trip={state.trip} />;
}
