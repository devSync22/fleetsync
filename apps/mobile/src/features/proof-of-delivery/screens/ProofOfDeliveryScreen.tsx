import { useLocalSearchParams } from 'expo-router';

import { isHeadingToDestination, TripGate, useTrip } from '@/features/trips';

import { PodSkeleton } from '../components/PodSkeleton';
import { ProofOfDeliveryForm } from '../components/ProofOfDeliveryForm';

/** Driver — Proof of delivery (Figma 298:7417). Opened with "Complete trip" on Active trip after pickup. */
export function ProofOfDeliveryScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId);

  return (
    <TripGate
      title="Proof of delivery"
      tripId={tripId}
      state={state}
      retry={retry}
      allows={isHeadingToDestination}
      skeleton={<PodSkeleton />}>
      {(trip) => <ProofOfDeliveryForm trip={trip} onCancelled={reload} />}
    </TripGate>
  );
}
