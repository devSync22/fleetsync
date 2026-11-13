import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { radii, spacing } from '@/theme';

/** Grey blocks in the shape of the profile cards while it loads. */
export function ProfileSkeleton() {
  return (
    <View style={styles.list} accessible accessibilityLabel="Loading your profile">
      <Skeleton height={94} radius={radii.card} />
      <Skeleton height={210} radius={radii.card} />
      <Skeleton height={230} radius={radii.card} />
      <Skeleton height={110} radius={radii.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xl,
  },
});
