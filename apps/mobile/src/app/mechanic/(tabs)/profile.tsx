import { router } from 'expo-router';
import { User } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { StatusBadge } from '@/components/ui';

export default function MechanicProfileRoute() {
  return (
    <PlaceholderScreen
      title="Profile"
      subtitle="Ishara Bandara · MEC-012"
      headerRight={<StatusBadge label="Active" />}
      icon={User}
      emptyTitle="Profile coming soon"
      emptyDescription="Contact details and password settings will be shown here."
      action={{ label: 'Sign out', variant: 'secondary', onPress: () => router.replace('/sign-in') }}
    />
  );
}
