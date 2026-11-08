import { Check, CircleX } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { formatDistance } from '@/lib/format';
import { colors, sizes, spacing, typography } from '@/theme';

type OdometerStatusProps = {
  digits: string;
  error: string | undefined;
  startOdometerKm: number | undefined;
};

/** Line under the odometer: "✓ 38 km driven on this trip", or the validation error once typing starts. */
export function OdometerStatus({ digits, error, startOdometerKm }: OdometerStatusProps) {
  if (!digits) return null;

  if (error) {
    return (
      <View style={styles.row} accessibilityRole="alert">
        <CircleX size={sizes.iconXs} color={colors.danger} />
        <Text style={[typography.caption, styles.text, { color: colors.danger }]}>{error}</Text>
      </View>
    );
  }

  if (startOdometerKm === undefined) return null;

  return (
    <View style={styles.row}>
      <Check size={sizes.iconXs} color={colors.success} />
      <Text style={[typography.caption, styles.text, { color: colors.success }]}>
        {formatDistance(Number(digits) - startOdometerKm)} driven on this trip
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    flexShrink: 1,
  },
});
