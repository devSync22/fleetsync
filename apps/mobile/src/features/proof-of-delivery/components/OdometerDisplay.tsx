import { StyleSheet, Text, View } from 'react-native';

import { formatNumber } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

type OdometerDisplayProps = {
  /** Digits typed on the keypad. */
  digits: string;
  invalid: boolean;
};

/** Big focused field showing the ending odometer as it's typed on the keypad — "84,274 | km". */
export function OdometerDisplay({ digits, invalid }: OdometerDisplayProps) {
  const value = digits ? formatNumber(Number(digits)) : '0';

  return (
    <View
      style={[styles.box, invalid && styles.invalid]}
      accessible
      accessibilityLabel={`Ending odometer reading: ${digits ? `${value} km` : 'not entered'}`}
      accessibilityLiveRegion="polite">
      <Text style={[typography.odometer, !digits && styles.placeholder]} numberOfLines={1}>
        {value}
      </Text>
      <View style={[styles.cursor, invalid && styles.cursorInvalid]} />
      <View style={styles.spacer} />
      <Text style={typography.odometerUnit}>km</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl + spacing.xxs,
    paddingVertical: spacing.xxl,
    borderRadius: radii.panel,
    borderWidth: sizes.focusBorder,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
    boxShadow: `0px 0px 0px 3px ${colors.accentSoft}`,
  },
  invalid: {
    borderColor: colors.danger,
    boxShadow: `0px 0px 0px 3px ${colors.dangerSoft}`,
  },
  placeholder: {
    color: colors.faint,
  },
  cursor: {
    width: sizes.focusBorder,
    height: sizes.odometerCursor,
    backgroundColor: colors.accent,
  },
  cursorInvalid: {
    backgroundColor: colors.danger,
  },
  spacer: {
    flex: 1,
  },
});
