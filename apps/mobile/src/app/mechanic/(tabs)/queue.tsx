import { Wrench } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { Avatar } from '@/components/ui';

export default function MechanicQueueRoute() {
  return (
    <PlaceholderScreen
      title="Maintenance queue"
      subtitle="Ishara Bandara · Colombo depot"
      headerRight={<Avatar name="Ishara Bandara" />}
      icon={Wrench}
      emptyTitle="Queue is clear"
      emptyDescription="Driver reports and scheduled services will appear here."
    />
  );
}
