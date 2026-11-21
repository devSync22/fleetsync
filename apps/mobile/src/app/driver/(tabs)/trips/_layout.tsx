import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Trips tab stack: My trips, then Trip details opened from it — keeps the driver on the Trips tab. */
export default function DriverTripsStackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
