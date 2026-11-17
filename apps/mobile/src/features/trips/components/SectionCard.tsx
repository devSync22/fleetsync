import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/ui';
import { spacing, typography } from '@/theme';

type SectionCardProps = {
  /** Section label — "Route", "Cargo", "People on this trip" (shown uppercase). */
  title: string;
  children: ReactNode;
};

/** Card with an uppercase section label, as used on Driver — Trip details. */
export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={typography.sectionLabel} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: spacing.xl,
    gap: spacing.lg,
  },
});
