import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { spacing } from '@/theme';

/** Loading placeholder shaped like the My trips list: three tiles and a list card. */
export function TripHistorySkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading your trips">
      <View style={styles.row}>
        <Skeleton width="31%" height={52} />
        <Skeleton width="31%" height={52} />
        <Skeleton width="31%" height={52} />
      </View>
      <Card>
        {[0, 1, 2, 3].map((key) => (
          <View key={key} style={styles.line}>
            <Skeleton width="60%" height={14} />
            <Skeleton width="40%" height={12} />
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  line: {
    gap: spacing.sm,
  },
});
