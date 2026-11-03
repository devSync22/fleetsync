import { Upload } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type AddDocumentButtonProps = {
  onPress: () => void;
  invalid?: boolean;
};

/** Dashed "Add file or take photo" drop zone. */
export function AddDocumentButton({ onPress, invalid = false }: AddDocumentButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add file or take photo"
      onPress={onPress}
      style={({ pressed }) => [styles.button, invalid && styles.invalid, pressed && styles.pressed]}>
      <Upload size={sizes.iconSm} color={colors.accent} />
      <Text style={typography.link}>Add file or take photo</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderRadius: radii.tile,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  invalid: {
    borderColor: colors.danger,
  },
  pressed: {
    backgroundColor: colors.greySoft,
  },
});
