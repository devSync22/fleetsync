import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radii, sizes } from '@/theme';

type IconButtonProps = {
  icon: LucideIcon;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** Circle size; 36 inside cards, 40 on the active trip stop card. */
  size?: number;
};


/** Round accent-soft icon button inside cards — call a stop contact, open a chat (Driver — Trip details). */
export function IconButton({ icon: Icon, accessibilityLabel, onPress, disabled = false, size = sizes.iconButton }: IconButtonProps) {
  // Extra hit area so the circle still meets the 44 px touch target.
  const hitSlop = Math.max(0, (sizes.touchTarget - size) / 2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}>
      <Icon size={sizes.iconSm} color={disabled ? colors.faint : colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    backgroundColor: colors.greySoft,
  },
  pressed: {
    opacity: 0.7,
  },
});
