import { Truck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import type { Trip } from '@/features/trips';
import { formatDate, formatDistance, formatTime } from '@/lib/format';
import { colors, sizes, spacing, typography } from '@/theme';

type UpcomingTripCardProps = {
  trip: Trip;
  onPress: () => void;
};

/** UPCOMING: one later trip; tapping opens Trip details. */
export function UpcomingTripCard({ trip, onPress }: UpcomingTripCardProps) {
  const route = `${trip.pickup.area} → ${trip.destination.area}`;
  const date = formatDate(trip.scheduledStart, 'short');
  const time = formatTime(trip.scheduledStart);

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${route}, ${trip.id}, ${date} at ${time}. Opens trip details.`}
      style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={typography.bodyStrong} numberOfLines={1}>
            {route}
          </Text>
          <Text style={typography.caption} numberOfLines={1}>
            {trip.id} · {trip.customerName} · {formatDistance(trip.distanceKm)}
          </Text>
        </View>
        <View style={styles.when}>
          <Text style={typography.caption}>{date}</Text>
          <Text style={typography.monoBody}>{time}</Text>
        </View>
      </View>
      <View style={styles.vehicle}>
        <Truck size={sizes.iconXs} color={colors.muted} />
        <Text style={typography.caption} numberOfLines={1}>
          {trip.vehicle.plate} · {trip.vehicle.model}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
  when: {
    alignItems: 'flex-end',
    gap: 1,
  },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
