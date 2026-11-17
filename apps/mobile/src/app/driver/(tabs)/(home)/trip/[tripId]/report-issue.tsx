import { useLocalSearchParams } from 'expo-router';
import { TriangleAlert } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

/** Placeholder until the vehicle-issues branch builds Driver — Report issue. */
export default function ReportIssueRoute() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  return (
    <PlaceholderScreen
      title="Report issue"
      subtitle={tripId}
      icon={TriangleAlert}
      emptyTitle="Reporting issues is coming next"
      emptyDescription="You’ll report a vehicle problem to your mechanic here. This screen is built in the vehicle-issues branch."
    />
  );
}
