import { useLocalSearchParams } from 'expo-router';

import { CargoPickupForm } from '../components/CargoPickupForm';
import { TripGate } from '../components/TripGate';
import { useTrip } from '../hooks/useTrip';

/** Driver — Cargo picked up (Figma 400:8282). Opened with "Cargo picked up" on Active trip (to pickup). */
export function CargoPickedUpScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId);

  return (
    <TripGate
      title="Confirm cargo picked up"
      tripId={tripId}
      state={state}
      retry={retry}
      allows={(trip) => trip.status === 'Started'}>
      {(trip) => <CargoPickupForm trip={trip} onCancelled={reload} />}
    </TripGate>
  );
}
