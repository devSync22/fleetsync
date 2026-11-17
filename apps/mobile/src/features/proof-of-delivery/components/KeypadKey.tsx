import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, typography } from '@/theme';

type KeypadKeyProps = {
  accessibilityLabel: string;
  onPress: () => void;
  onLongPress?: () => void;
  label?: string;
  icon?: LucideIcon;
  disabled?: boolean;
};

/** One key on the odometer keypad. */
export function KeypadKey({ accessibilityLabel, onPress, onLongPress, label, icon: Icon, disabled = false }: KeypadKeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [styles.key, pressed && styles.pressed]}>
      {Icon ? <Icon size={sizes.iconMd} color={colors.text} /> : <Text style={typography.keypadKey}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    flex: 1,
    height: sizes.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.tile,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
});
