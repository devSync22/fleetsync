import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Filter chip (Mechanic — Queue): selected is dark with a white label, others are white with a border. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6 }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.selected : styles.unselected,
        pressed && styles.pressed,
      ]}>
      <Text style={[typography.chip, { color: selected ? colors.surface : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: sizes.hairline,
  },
  selected: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
  },
  pressed: {
    opacity: 0.85,
  },
});
