import { LogOut } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

/** Soft red "Sign out" button at the bottom of Profile. */
export function SignOutButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <LogOut size={sizes.iconSm} color={colors.danger} />
      <Text style={[typography.button, styles.label]}>Sign out</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: sizes.button,
    borderRadius: radii.panel,
    backgroundColor: colors.dangerSoft,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.danger,
  },
});
