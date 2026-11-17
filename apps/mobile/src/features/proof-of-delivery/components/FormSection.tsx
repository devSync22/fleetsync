import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/theme';

type FormSectionProps = {
  title: string;
  /** Muted text on the right — "2 of 3 added", "Optional". */
  meta?: string;
  /** Accent text action on the right instead of `meta` — "Clear". */
  action?: { label: string; onPress: () => void; accessibilityLabel?: string };
  children: ReactNode;
};

/** Section title row + content, as on Driver — Proof of delivery ("Delivery photos", "Received by"…). */
export function FormSection({ title, meta, action, children }: FormSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text style={typography.bodyStrong} accessibilityRole="header">
          {title}
        </Text>
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel ?? action.label}
            onPress={action.onPress}
            hitSlop={spacing.lg}>
            <Text style={typography.linkSmall}>{action.label}</Text>
          </Pressable>
        ) : meta ? (
          <Text style={[typography.caption, styles.meta]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.ml,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  meta: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
