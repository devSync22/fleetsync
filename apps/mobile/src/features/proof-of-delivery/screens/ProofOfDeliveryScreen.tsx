import { useLocalSearchParams } from 'expo-router';

import { canCompleteTrip, useTrip } from '@/features/trips';

import { PodTripGate } from '../components/PodTripGate';
import { ProofOfDeliveryForm } from '../components/ProofOfDeliveryForm';

/** Driver — Proof of delivery (Figma 298:7417). Opened with "Complete trip" on an In-progress trip. */
export function ProofOfDeliveryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry } = useTrip(tripId);

  if (state.kind !== 'loaded' || !canCompleteTrip(state.trip)) {
    return <PodTripGate title="Proof of delivery" tripId={tripId} state={state} retry={retry} />;
  }
  return <ProofOfDeliveryForm trip={state.trip} />;
}
