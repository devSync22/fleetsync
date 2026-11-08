import { useLocalSearchParams } from 'expo-router';
import { Gauge } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

/** Placeholder until the trip-flow branch (feature 4) builds Driver — Start trip. */
export default function StartTripRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <PlaceholderScreen
      title="Start trip"
      subtitle={tripId}
      icon={Gauge}
      emptyTitle="Start trip is coming next"
      emptyDescription="You’ll enter the starting odometer reading here. This screen is built in the trip-flow branch."
    />
  );
}
