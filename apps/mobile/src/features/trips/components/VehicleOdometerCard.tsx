import { Truck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatDistance, formatWeight } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { TripVehicle } from '../types';

type VehicleOdometerCardProps = {
  vehicle: TripVehicle;
  /** "Last reading" (Start trip), "Started at" (Complete trip). */
  readingLabel: string;
  readingKm: number | undefined;
};

/** Trip vehicle with an odometer reading on the right — top card on Start trip and Complete trip. */
export function VehicleOdometerCard({ vehicle, readingLabel, readingKm }: VehicleOdometerCardProps) {
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
      {readingKm !== undefined ? (
        <View style={styles.reading} accessible accessibilityLabel={`${readingLabel} ${formatDistance(readingKm)}`}>
          <Text style={typography.micro}>{readingLabel}</Text>
          <Text style={typography.mono}>{formatDistance(readingKm)}</Text>
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
  reading: {
    alignItems: 'flex-end',
    gap: 1,
  },
});
