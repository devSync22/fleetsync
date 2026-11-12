import { useLocalSearchParams } from 'expo-router';

import { TripGate, useTrip } from '@/features/trips';

import { CompleteTripForm } from '../components/CompleteTripForm';

/** Driver — Complete trip (Figma 173:6655). Opened after the proof of delivery is sent (trip Delivered). */
export function CompleteTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId);

  return (
    <TripGate
      title="Complete trip"
      tripId={tripId}
      state={state}
      retry={retry}
      allows={(trip) => trip.status === 'Delivered'}>
      {(trip) => <CompleteTripForm trip={trip} onCancelled={reload} />}
    </TripGate>
  );
}
