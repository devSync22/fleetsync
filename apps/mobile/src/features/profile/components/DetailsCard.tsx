import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type DetailsCardProps = {
  /** "Personal details" (shown uppercase). */
  title: string;
  /** "Changes are sent to a Fleet Administrator for approval." */
  description?: string;
  children: ReactNode;
};

/** White profile section: uppercase label + optional note, then full-width rows (Driver — Profile). */
export function DetailsCard({ title, description, children }: DetailsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={typography.sectionLabel} accessibilityRole="header">
          {title}
        </Text>
        {description ? <Text style={typography.captionLong}>{description}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  header: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
