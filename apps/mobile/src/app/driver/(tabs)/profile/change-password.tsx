import { router } from 'expo-router';

import { ChangePasswordScreen } from '@/features/profile/screens/ChangePasswordScreen';
import { PASSWORD_UPDATED_NOTICE } from '@/features/profile/screens/ProfileScreen';

export default function DriverChangePasswordRoute() {
  return (
    <ChangePasswordScreen
      onUpdated={(changedAt) =>
        router.dismissTo({ pathname: '/driver/profile', params: { notice: PASSWORD_UPDATED_NOTICE, changedAt } })
      }
    />
  );
}
