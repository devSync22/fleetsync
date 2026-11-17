import { User } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { StatusBadge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSettingsCard } from '@/features/notifications';

export default function DriverProfileRoute() {
  const { user, signOut } = useAuth();

  return (
    <PlaceholderScreen
      title="Profile"
      subtitle={user ? `${user.name} · ${user.staffId}` : undefined}
      headerRight={<StatusBadge label="Available" />}
      icon={User}
      emptyTitle="Profile coming soon"
      emptyDescription="Licence, contact details and password settings will be shown here."
      // Signing out changes the route guards, which return to Sign in.
      action={{ label: 'Sign out', variant: 'secondary', onPress: signOut }}>
      <NotificationSettingsCard />
    </PlaceholderScreen>
  );
}
