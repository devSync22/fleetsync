import { router } from 'expo-router';
import { User } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { StatusBadge } from '@/components/ui';

export default function DriverProfileRoute() {
  return (
    <PlaceholderScreen
      title="Profile"
      subtitle="Kasun · DRV-014"
      headerRight={<StatusBadge label="Available" />}
      icon={User}
      emptyTitle="Profile coming soon"
      emptyDescription="Licence, contact details and password settings will be shown here."
      action={{ label: 'Sign out', variant: 'secondary', onPress: () => router.replace('/sign-in') }}
    />
  );
}
