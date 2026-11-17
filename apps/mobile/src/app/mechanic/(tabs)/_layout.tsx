import { Tabs } from 'expo-router/js-tabs';
import { Calendar, TriangleAlert, User, Wrench } from 'lucide-react-native';

import { tabIcon, useTabBarOptions } from '@/hooks/useTabBarOptions';

/** Mechanic bottom tabs — Figma "Mobile tab bar" (Mechanic): Queue, Issues, Services, Profile. */
export default function MechanicTabsLayout() {
  const screenOptions = useTabBarOptions();

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="queue" options={{ title: 'Queue', tabBarIcon: tabIcon(Wrench) }} />
      <Tabs.Screen name="issues" options={{ title: 'Issues', tabBarIcon: tabIcon(TriangleAlert) }} />
      <Tabs.Screen name="services" options={{ title: 'Services', tabBarIcon: tabIcon(Calendar) }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon(User) }} />
    </Tabs>
  );
}
