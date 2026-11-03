import { useNavigation } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing, typography } from '@/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /**
   * Show the back button. Defaults to `true` when there is a screen to go back to,
   * so tab roots get no back button automatically.
   */
  showBack?: boolean;
  /** Custom back action; defaults to going back in the current navigator. */
  onBack?: () => void;
  /** Render the title in JetBrains Mono (trip or order references like "TRP-2208"). */
  monoTitle?: boolean;
  /** Right-hand slot, e.g. a StatusBadge or an icon button. */
  right?: ReactNode;
};

/** App bar from the mobile frames: back chevron, title + subtitle, optional right slot. Includes the top safe area. */
export function ScreenHeader({ title, subtitle, showBack, onBack, monoTitle = false, right }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  // Use the navigation hook, not the imperative `router`: `router` throws if used before the first render finishes.
  const navigation = useNavigation();
  // Only a screen pushed onto a stack gets a back button. Tab roots don't, even though the tab
  // navigator itself can "go back" to the previous tab.
  const state = navigation.getState();
  const canGoBack = showBack ?? (state?.type === 'stack' && state.index > 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.ml }]}>
      {canGoBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack ?? (() => navigation.goBack())}
          hitSlop={spacing.lg}
          style={styles.back}>
          <ChevronLeft size={sizes.iconLg} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.titles}>
        <Text style={monoTitle ? typography.monoLarge : typography.headerTitle} numberOfLines={1} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? (
          <Text style={typography.caption} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.ml,
    minHeight: sizes.touchTarget,
    backgroundColor: colors.surface,
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  back: {
    width: sizes.iconLg,
    height: sizes.iconLg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: {
    flex: 1,
    gap: 1,
  },
  right: {
    flexShrink: 0,
  },
});
