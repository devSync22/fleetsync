import type { LucideIcon } from 'lucide-react-native';
import type { ComponentProps, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ScreenHeader } from '@/components/ui';
import { colors, spacing } from '@/theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  icon?: LucideIcon;
  action?: ComponentProps<typeof EmptyState>['action'];
  /** Sections already built for this screen, shown under the placeholder. */
  children?: ReactNode;
};

/**
 * Temporary screen body for routes whose feature branch hasn't been built yet.
 * Replace each usage with the real `features/<feature>/screens/XxxScreen` when that branch starts.
 */
export function PlaceholderScreen({
  title,
  subtitle,
  headerRight,
  emptyTitle,
  emptyDescription,
  icon,
  action,
  children,
}: PlaceholderScreenProps) {
  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} subtitle={subtitle} right={headerRight} />
      <ScrollView contentContainerStyle={styles.body}>
        <EmptyState title={emptyTitle} description={emptyDescription} icon={icon} action={action} />
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
});
