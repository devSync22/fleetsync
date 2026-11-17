import { Truck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import type { Trip } from '@/features/trips';
import { formatDistance, formatWeight } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

/** Trip vehicle with the starting odometer — top card on Driver — Complete trip. */
export function VehicleOdometerCard({ trip }: { trip: Trip }) {
  const { vehicle, startOdometerKm } = trip;

  return (
    <Card style={styles.card}>
      <View style={styles.iconBox}>
        <Truck size={sizes.iconMd} color={colors.muted} />
      </View>
      <View style={styles.vehicle}>
        <Text style={typography.monoPlate}>{vehicle.plate}</Text>
        <Text style={typography.caption} numberOfLines={1}>
          {vehicle.model} · {formatWeight(vehicle.capacityTonnes)}
        </Text>
      </View>
      {startOdometerKm !== undefined ? (
        <View style={styles.start} accessible accessibilityLabel={`Started at ${formatDistance(startOdometerKm)}`}>
          <Text style={typography.micro}>Started at</Text>
          <Text style={typography.mono}>{formatDistance(startOdometerKm)}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  iconBox: {
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radii.tile,
    backgroundColor: colors.greySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicle: {
    flex: 1,
    gap: 1,
  },
  start: {
    alignItems: 'flex-end',
    gap: 1,
  },
});
