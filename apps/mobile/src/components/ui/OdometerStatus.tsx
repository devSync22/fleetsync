import { Check, CircleX } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

type OdometerStatusProps = {
  /** Validation error; wins over `success`. */
  error?: string;
  /** "38 km driven on this trip", "26 km more than the last reading". */
  success?: string;
};

/** Line under the odometer: a green tick with `success`, or the validation error. Nothing when both are empty. */
export function OdometerStatus({ error, success }: OdometerStatusProps) {
  const message = error ?? success;
  if (!message) return null;
  const color = error ? colors.danger : colors.success;
  const Icon = error ? CircleX : Check;

  return (
    <View style={styles.row} accessibilityRole={error ? 'alert' : undefined}>
      <Icon size={sizes.iconXs} color={color} />
      <Text style={[typography.caption, styles.text, { color }]}>{message}</Text>
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
