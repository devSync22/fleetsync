import { Truck } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Avatar } from '@/components/ui';

export default function DriverHomeRoute() {
  return (
    <PlaceholderScreen
      title="Home"
      subtitle="Kasun · DRV-014"
      headerRight={<Avatar name="Kasun" initials="KJ" />}
      icon={Truck}
      emptyTitle="No trips today"
      emptyDescription="Trips assigned to you by the coordinator will appear here."
    />
  );
}
