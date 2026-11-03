import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Sign-in flow: sign-in → request-account → request-sent → account-approved. Only reachable when signed out. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />;
}
