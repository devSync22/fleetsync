import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** A room opened from a trip screen still has the room list underneath to go back to. */
export const unstable_settings = {
  anchor: 'index',
};

/** Chat tab stack: room list, then an order's room. Inside the tab so the tab bar stays visible. */
export default function ChatStackLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
