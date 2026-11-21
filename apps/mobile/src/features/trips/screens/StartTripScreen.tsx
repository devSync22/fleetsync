import { useLocalSearchParams } from 'expo-router';

import { StartTripForm } from '../components/StartTripForm';
import { TripGate } from '../components/TripGate';
import { useTrip } from '../hooks/useTrip';
import { canStartTrip } from '../tripStatus';

/** Driver — Start trip (Figma 170:6514). Opened with "Start trip" on Home or Trip details. */
export function StartTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId);

  return (
    <TripGate title="Start trip" tripId={tripId} state={state} retry={retry} allows={canStartTrip}>
      {(trip) => <StartTripForm trip={trip} onCancelled={reload} />}
    </TripGate>
  );
}
