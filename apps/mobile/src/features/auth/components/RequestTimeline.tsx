import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

type StepState = 'done' | 'current' | 'upcoming';

type TimelineStep = {
  title: string;
  description: string;
  state: StepState;
  /** Makes the step tappable (prototype link from "Under review" to the approval screen). */
  onPress?: () => void;
};

const DOT_SIZE = 14;

function StepDot({ state }: { state: StepState }) {
  return (
    <View
      style={[
        styles.dot,
        state === 'done' && styles.dotDone,
        state === 'current' && styles.dotCurrent,
        state === 'upcoming' && styles.dotUpcoming,
      ]}
    />
  );
}

/** Vertical status timeline on "Request sent": Request sent → Under review → Account ready. */
export function RequestTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.list}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const muted = step.state === 'upcoming';
        const content = (
          <>
            <View style={styles.rail}>
              <StepDot state={step.state} />
              {!isLast ? <View style={[styles.line, step.state === 'done' && styles.lineDone]} /> : null}
            </View>
            <View style={[styles.text, !isLast && styles.textSpaced]}>
              <Text style={[typography.bodyStrong, muted && styles.mutedText]}>{step.title}</Text>
              <Text style={typography.caption}>{step.description}</Text>
            </View>
          </>
        );

        return step.onPress ? (
          <Pressable
            key={step.title}
            accessibilityRole="button"
            accessibilityLabel={`${step.title}. ${step.description}`}
            onPress={step.onPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            {content}
          </Pressable>
        ) : (
          <View key={step.title} style={styles.row} accessible accessibilityLabel={`${step.title}. ${step.description}`}>
            {content}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  pressed: {
    opacity: 0.7,
  },
  rail: {
    width: DOT_SIZE,
    alignItems: 'center',
    paddingTop: spacing.xxs,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotCurrent: {
    backgroundColor: colors.surface,
    borderWidth: sizes.focusBorder,
    borderColor: colors.info,
  },
  dotUpcoming: {
    backgroundColor: colors.surface,
    borderWidth: sizes.focusBorder,
    borderColor: colors.line,
  },
  line: {
    flex: 1,
    width: sizes.focusBorder,
    backgroundColor: colors.line,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  textSpaced: {
    paddingBottom: spacing.md,
  },
  mutedText: {
    color: colors.muted,
  },
});
