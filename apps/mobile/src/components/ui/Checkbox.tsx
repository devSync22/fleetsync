import { Check, CircleX } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

const BOX_SIZE = 18;
/** Extra vertical hit area so the 18 px box still meets the 44 px touch target. */
const HIT_SLOP = (sizes.touchTarget - BOX_SIZE) / 2;

type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Validation error shown under the checkbox. */
  error?: string;
  /** `sm` = 13 px label (inline options), `md` = 14 px label (form confirmations). */
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

/** Checkbox with a label (Figma: "Keep me signed in", "The details I've given are correct"). */
export function Checkbox({ label, checked, onChange, error, size = 'md', style }: CheckboxProps) {
  return (
    <View style={[styles.container, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        onPress={() => onChange(!checked)}
        hitSlop={{ top: HIT_SLOP, bottom: HIT_SLOP }}
        style={styles.row}>
        <View style={[styles.box, checked ? styles.checked : error ? styles.errorBox : styles.unchecked]}>
          {checked ? <Check size={12} color={colors.surface} strokeWidth={3} /> : null}
        </View>
        <Text style={[size === 'sm' ? typography.bodySmall : typography.body, styles.label]}>{label}</Text>
      </Pressable>
      {error ? (
        <View style={styles.message}>
          <CircleX size={sizes.iconXs} color={colors.danger} />
          <Text style={[typography.caption, styles.messageText]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ml,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    backgroundColor: colors.accent,
  },
  unchecked: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
  },
  errorBox: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.danger,
  },
  label: {
    flexShrink: 1,
    lineHeight: undefined,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageText: {
    flexShrink: 1,
  },
});
