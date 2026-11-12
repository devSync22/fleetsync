import { Stack } from 'expo-router';

import { ChatProvider } from '@/features/chat';

/** Mechanic area: the tabs, plus detail screens (resolve issue, record maintenance…) added in later branches. */
export default function MechanicLayout() {
  // Chat stays connected while the user is in this area, so the Chat tab badge updates on every tab.
  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ChatProvider>
  );
}
