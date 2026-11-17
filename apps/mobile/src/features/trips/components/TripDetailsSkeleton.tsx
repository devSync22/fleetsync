import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, sizes, spacing } from '@/theme';

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <Card style={styles.card}>
      <Skeleton width={90} height={10} />
      {Array.from({ length: rows }, (_, index) => (
        <View key={index} style={styles.row}>
          <View style={styles.lines}>
            <Skeleton width="40%" height={10} />
            <Skeleton width="75%" height={14} />
            <Skeleton width="60%" height={10} />
          </View>
          <Skeleton width={sizes.iconButton} height={sizes.iconButton} radius={radii.pill} />
        </View>
      ))}
    </Card>
  );
}

/** Loading placeholder shaped like Trip details. */
export function TripDetailsSkeleton() {
  return (
    <View style={styles.container} accessibilityLabel="Loading trip" accessible>
      <SectionSkeleton rows={2} />
      <SectionSkeleton rows={1} />
      <SectionSkeleton rows={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  lines: {
    flex: 1,
    gap: spacing.sm,
  },
});
