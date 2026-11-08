import type { BottomTabNavigationOptions } from 'expo-router/js-tabs';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, sizes, spacing, typography } from '@/theme';

/**
 * Screen options for the Driver and Mechanic bottom tabs, matching the Figma
 * "Mobile tab bar — component": 64 px bar above the home indicator, 22 px icons,
 * 11 px labels, accent + Semi Bold when active, muted + Medium otherwise.
 */
export function useTabBarOptions(): BottomTabNavigationOptions {
  const insets = useSafeAreaInsets();

  return {
    headerShown: false,
    // Android: don't push the tab bar up on top of the keyboard while typing in a form.
    tabBarHideOnKeyboard: true,
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: {
      height: sizes.tabBar + insets.bottom,
      paddingTop: spacing.md,
      paddingBottom: insets.bottom + spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderTopWidth: sizes.hairline,
      borderTopColor: colors.border,
      elevation: 0,
      shadowOpacity: 0,
    },
    tabBarItemStyle: {
      gap: spacing.xs,
    },
    tabBarLabel: ({ focused, color, children }) => (
      <Text style={[typography.tabLabel, { color, fontFamily: focused ? fonts.semiBold : fonts.medium }]}>
        {children}
      </Text>
    ),
  };
}

/** `tabBarIcon` for a lucide icon at the Figma tab icon size. */
export function tabIcon(Icon: LucideIcon): BottomTabNavigationOptions['tabBarIcon'] {
  return function TabIcon({ color }) {
    return <Icon size={sizes.iconLg} color={color} />;
  };
}
