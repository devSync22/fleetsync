import { Check, Circle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import type { PasswordCheck } from '@/lib/password';
import { colors, sizes, spacing, typography } from '@/theme';

/** Live password checklist: green tick when a rule is met. Pass `getPasswordChecks(...)` from `@/lib/password`. */
export function PasswordRules({ checks }: { checks: PasswordCheck[] }) {
  return (
    <View style={styles.list}>
      {checks.map((check) => {
        const Icon = check.met ? Check : Circle;
        return (
          <View
            key={check.id}
            style={styles.row}
            accessible
            accessibilityLabel={`${check.label}: ${check.met ? 'done' : 'not yet'}`}>
            <Icon size={sizes.iconXs} color={check.met ? colors.success : colors.faint} />
            <Text style={[typography.caption, { color: check.met ? colors.success : colors.muted }]}>
              {check.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
