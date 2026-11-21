import { StyleSheet, Text, View } from 'react-native';

import { Card, StatusBadge } from '@/components/ui';
import { formatWeight } from '@/lib/format';
import { spacing, typography } from '@/theme';

import type { Trip } from '../types';

/** "40 cool boxes · 2.1 t" with the handling badges, at the bottom of Driver — Active trip. */
export function ActiveCargoCard({ trip }: { trip: Trip }) {
  const { cargo } = trip;

  return (
    <Card style={styles.card}>
      <Text style={[typography.label, styles.text]}>
        {cargo.packageCount} {cargo.packageLabel} · {formatWeight(cargo.weightTonnes)}
      </Text>
      <View style={styles.badges}>
        {cargo.handling.map((instruction) => (
          // Handling instructions aren't statuses, so the tone is set here (info, as in the frame).
          <StatusBadge key={instruction} label={instruction} tone="info" />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  text: {
    flex: 1,
  },
  badges: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
