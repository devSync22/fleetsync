import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Home opens on Home; a trip link opened directly still has Home underneath to go back to. */
export const unstable_settings = {
  anchor: 'home',
};

/**
 * Home tab stack: Home, then the trip screens opened from it (Trip details, Start trip, Active trip,
 * Cargo picked up, Proof of delivery, Complete trip). Living inside the tab keeps the bottom tab bar on every screen.
 */
export default function DriverHomeStackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
