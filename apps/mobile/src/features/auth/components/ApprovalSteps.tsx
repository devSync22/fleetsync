import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

type ApprovalStep = {
  label: string;
  date: string;
};

const CIRCLE_SIZE = 20;

/** Horizontal "Sent — Reviewed — Approved" bar on "Account approved" (all steps done). */
export function ApprovalSteps({ steps }: { steps: ApprovalStep[] }) {
  return (
    <View style={styles.bar}>
      {steps.map((step, index) => (
        <View key={step.label} style={styles.step} accessible accessibilityLabel={`${step.label}, ${step.date}`}>
          <View style={styles.circle}>
            <Check size={12} color={colors.surface} strokeWidth={3} />
          </View>
          <View>
            <Text style={[typography.badge, styles.label]}>{step.label}</Text>
            <Text style={typography.tiny}>{step.date}</Text>
          </View>
          {index < steps.length - 1 ? <View style={styles.connector} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: radii.panel,
    backgroundColor: colors.background,
  },
  step: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.text,
  },
  connector: {
    flex: 1,
    height: sizes.focusBorder,
    backgroundColor: colors.success,
  },
});
