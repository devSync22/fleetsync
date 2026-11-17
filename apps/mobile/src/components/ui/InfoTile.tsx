import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type InfoTileProps = {
  label: string;
  value: string;
  /**
   * filled = grey tile inside a card (Vehicle / Cargo / Distance on the trip card);
   * outlined = white bordered tile on the screen background (This week / Distance / Issues reported).
   */
  variant?: 'filled' | 'outlined';
  /** JetBrains Mono for data values such as plates ("WP LB-7702"). */
  mono?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Small label + value tile. Place several in a row; each one grows to share the width. */
export function InfoTile({ label, value, variant = 'filled', mono = false, style }: InfoTileProps) {
  const isFilled = variant === 'filled';
  const valueStyle = mono ? typography.mono : isFilled ? typography.value : typography.bodyStrong;

  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={[styles.tile, isFilled ? styles.filled : styles.outlined, style]}>
      <Text style={typography.micro} numberOfLines={1}>
        {label}
      </Text>
      <Text style={valueStyle} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 0,
  },
  filled: {
    gap: 1,
    paddingHorizontal: spacing.ml,
    paddingVertical: spacing.md,
    borderRadius: radii.control,
    backgroundColor: colors.background,
  },
  outlined: {
    gap: spacing.xxs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.ml,
    borderRadius: radii.tile,
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
  },
});
