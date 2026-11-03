import { Route } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function DriverTripsRoute() {
  return (
    <PlaceholderScreen
      title="Trips"
      subtitle="Your trip history"
      icon={Route}
      emptyTitle="No trips yet"
      emptyDescription="Completed and cancelled trips will be listed here."
    />
  );
}
