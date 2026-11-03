import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/theme';

type DetailRowProps = {
  label: string;
  value: string;
  /** JetBrains Mono for IDs ("APP-2026-0118", "DRV-036"). */
  mono?: boolean;
};

/** Label on the left, value on the right ("Request ID … APP-2026-0118"). */
export function DetailRow({ label, value, mono = false }: DetailRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, mono && styles.mono]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  label: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSizes.md,
    color: colors.muted,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: fonts.medium,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  mono: {
    fontFamily: fonts.monoMedium,
  },
});
