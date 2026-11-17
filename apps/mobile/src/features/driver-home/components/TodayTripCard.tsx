import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, InfoTile, RouteTimeline, StatusBadge } from '@/components/ui';
import { tripBadgeLabel, type Trip } from '@/features/trips';
import { formatDistance, formatTime, formatWeight } from '@/lib/format';
import { spacing, typography } from '@/theme';

type TodayTripCardProps = {
  trip: Trip;
  /** "Start trip" or "Continue trip"; none once the trip is completed (view only). */
  primaryAction?: { label: string; onPress: () => void };
  onViewDetails: () => void;
};

/** TODAY: the driver's current trip with route, vehicle, cargo and actions (Driver — Home). */
export function TodayTripCard({ trip, primaryAction, onViewDetails }: TodayTripCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text style={typography.monoLarge}>{trip.id}</Text>
          <Text style={typography.caption} numberOfLines={1}>
            {trip.customerName} · {trip.orderId}
          </Text>
        </View>
        <StatusBadge label={tripBadgeLabel(trip.status)} />
      </View>

      <RouteTimeline
        stops={[
          {
            label: 'Pickup',
            name: `${trip.pickup.shortName}, ${trip.pickup.area}`,
            time: formatTime(trip.scheduledStart),
          },
          {
            label: 'Destination',
            name: `${trip.destination.shortName}, ${trip.destination.area}`,
            time: `by ${formatTime(trip.deliverBy)}`,
          },
        ]}
      />

      <View style={styles.tiles}>
        {/* The vehicle assigned to this trip — never a fixed vehicle for the driver. */}
        <InfoTile label="Vehicle" value={trip.vehicle.plate} mono />
        <InfoTile label="Cargo" value={formatWeight(trip.cargo.weightTonnes)} />
        <InfoTile label="Distance" value={formatDistance(trip.distanceKm)} />
      </View>

      {primaryAction ? <Button label={primaryAction.label} onPress={primaryAction.onPress} /> : null}
      <Button label="View trip details" variant="secondary" onPress={onViewDetails} />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
