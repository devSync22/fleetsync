import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Profile tab stack: Profile, then Upload renewed licence and Change password — keeps the tab bar visible. */
export default function DriverProfileStackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
