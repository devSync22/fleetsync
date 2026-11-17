import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, sizes, spacing } from '@/theme';

/** Loading placeholder shaped like Driver — Home: greeting, trip card, upcoming card, stat tiles. */
export function DriverHomeSkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading your trips">
      <View style={styles.greeting}>
        <View style={styles.lines}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="45%" height={12} />
        </View>
        <Skeleton width={sizes.avatar} height={sizes.avatar} radius={radii.pill} />
      </View>

      <Skeleton width={50} height={10} />
      <Card>
        <Skeleton width="35%" height={16} />
        <Skeleton width="80%" height={40} />
        <View style={styles.row}>
          <Skeleton width="31%" height={44} />
          <Skeleton width="31%" height={44} />
          <Skeleton width="31%" height={44} />
        </View>
        <Skeleton height={sizes.button} />
        <Skeleton height={sizes.button} />
      </Card>

      <Skeleton width={80} height={10} />
      <Card>
        <Skeleton width="60%" height={14} />
        <Skeleton width="45%" height={12} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxl,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  lines: {
    flex: 1,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
