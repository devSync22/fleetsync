import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { tripRouteLabel, tripRowDistance, tripRowSubtitle } from '../tripHistory';
import { tripBadgeLabel } from '../tripStatus';
import type { Trip } from '../types';

type TripHistoryRowProps = {
  trip: Trip;
  now: Date;
  isLast: boolean;
  onPress: () => void;
};

/** One trip in the My trips list: route, ID and date on the left; status and distance on the right. */
export function TripHistoryRow({ trip, now, isLast, onPress }: TripHistoryRowProps) {
  const route = tripRouteLabel(trip);
  const subtitle = tripRowSubtitle(trip, now);
  const badge = tripBadgeLabel(trip.status);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${route}, ${subtitle}, ${badge}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !isLast && styles.divider, pressed && styles.pressed]}>
      <View style={styles.text}>
        <Text style={typography.bodyStrong} numberOfLines={1}>
          {route}
        </Text>
        <Text style={typography.caption} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.right}>
        <StatusBadge label={badge} />
        <Text style={typography.monoCaption}>{tripRowDistance(trip)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ml,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
  text: {
    flex: 1,
    gap: spacing.xxs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
});
