import { User } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { StatusBadge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

export default function MechanicProfileRoute() {
  const { user, signOut } = useAuth();

  return (
    <PlaceholderScreen
      title="Profile"
      subtitle={user ? [user.name, user.staffId].filter(Boolean).join(' · ') : undefined}
      headerRight={<StatusBadge label="Active" />}
      icon={User}
      emptyTitle="Profile coming soon"
      emptyDescription="Contact details and password settings will be shown here."
      // Signing out changes the route guards, which return to Sign in.
      action={{ label: 'Sign out', variant: 'secondary', onPress: signOut }}
    />
  );
}
