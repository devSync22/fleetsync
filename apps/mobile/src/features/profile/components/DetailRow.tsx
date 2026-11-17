import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

type DetailRowProps = {
  label: string;
  /** Text value, or a node such as a StatusBadge. */
  value: ReactNode;
  /** JetBrains Mono for IDs ("B3318772"). */
  mono?: boolean;
  /** Amber, semi-bold value (licence expiring). */
  warning?: boolean;
  /** Line under the row; off for the last row of a card. */
  divider?: boolean;
};

/** "Mobile ........ 077 302 6618" row inside a DetailsCard. */
export function DetailRow({ label, value, mono = false, warning = false, divider = true }: DetailRowProps) {
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <Text style={styles.label}>{label}</Text>
      {typeof value === 'string' ? (
        <Text style={[mono ? typography.monoBody : typography.bodyMedium, warning && styles.warning]}>{value}</Text>
      ) : (
        value
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ml,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.ml,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    flex: 1,
    color: colors.muted,
  },
  warning: {
    ...typography.bodyStrong,
    color: colors.pending,
  },
});
