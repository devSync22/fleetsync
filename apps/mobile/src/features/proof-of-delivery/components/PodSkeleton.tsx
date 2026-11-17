import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { radii, sizes, spacing } from '@/theme';

/** Loading placeholder for the proof-of-delivery screens. */
export function PodSkeleton() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Loading trip">
      <Skeleton width={120} height={12} />
      <View style={styles.row}>
        <Skeleton width={sizes.photoTile} height={sizes.photoTile} radius={radii.tile} />
        <Skeleton width={sizes.photoTile} height={sizes.photoTile} radius={radii.tile} />
      </View>
      <Skeleton width={100} height={12} />
      <Skeleton height={sizes.touchTarget} />
      <Skeleton width={110} height={12} />
      <Skeleton height={sizes.signaturePad} radius={radii.tile} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.ml,
  },
});
