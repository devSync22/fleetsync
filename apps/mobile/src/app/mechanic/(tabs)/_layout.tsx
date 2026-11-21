import { Tabs } from 'expo-router/js-tabs';
import { Calendar, MessageCircle, TriangleAlert, User, Wrench } from 'lucide-react-native';

import { useChat } from '@/features/chat';
import { chatTabOptions, tabIcon, useTabBarOptions } from '@/hooks/useTabBarOptions';

/**
 * Mechanic bottom tabs — Figma "Mobile tab bar" (Mechanic): Queue, Issues, Services, Profile, plus Chat
 * (KAN-340; the Mechanic — Chat frame has no Chat tab, so it sits before Profile as on the driver tab bar).
 */
export default function MechanicTabsLayout() {
  const screenOptions = useTabBarOptions();
  const { unreadCount } = useChat();

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="queue" options={{ title: 'Queue', tabBarIcon: tabIcon(Wrench) }} />
      <Tabs.Screen name="issues" options={{ title: 'Issues', tabBarIcon: tabIcon(TriangleAlert) }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: tabIcon(Calendar) }} />
      <Tabs.Screen name="chat" options={chatTabOptions(MessageCircle, unreadCount)} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}
