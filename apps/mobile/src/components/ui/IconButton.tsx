import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { colors, radii, sizes } from '@/theme';

type IconButtonProps = {
  icon: LucideIcon;
  /** Required: the button has no visible text. */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

/** Extra hit area so the 36 px circle still meets the 44 px touch target. */
const HIT_SLOP = (sizes.touchTarget - sizes.iconButton) / 2;

/** Round accent-soft icon button inside cards — call a stop contact, open a chat (Driver — Trip details). */
export function IconButton({ icon: Icon, accessibilityLabel, onPress, disabled = false }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}>
      <Icon size={sizes.iconSm} color={disabled ? colors.faint : colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.iconButton,
    height: sizes.iconButton,
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
