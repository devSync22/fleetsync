import { Check } from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatTime } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { isHeadingToDestination } from '../tripStatus';
import type { Trip } from '../types';

type StepState = 'done' | 'current' | 'upcoming';

type Step = {
  label: string;
  state: StepState;
  /** Clock time ("09:41", mono) or a word ("Now", "Next", "By 12:00"). */
  detail: string;
  mono: boolean;
};

function stepsFor(trip: Trip): Step[] {
  const started: Step = {
    label: 'Trip started',
    state: 'done',
    detail: trip.startedAt ? formatTime(trip.startedAt) : '—',
    mono: Boolean(trip.startedAt),
  };
  if (trip.status === 'Started') {
    return [
      started,
      { label: 'Cargo picked up', state: 'current', detail: 'Now', mono: false },
      { label: 'Delivered', state: 'upcoming', detail: `By ${formatTime(trip.deliverBy)}`, mono: false },
    ];
  }
  const pickedUp: Step = {
    label: 'Cargo picked up',
    state: 'done',
    detail: trip.pickedUpAt ? formatTime(trip.pickedUpAt) : '—',
    mono: Boolean(trip.pickedUpAt),
  };
  if (isHeadingToDestination(trip)) {
    return [started, pickedUp, { label: 'Delivered', state: 'current', detail: 'Next', mono: false }];
  }
  // Delivered (and a trip cancelled after pickup): all reached steps done.
  return [
    started,
    pickedUp,
    trip.deliveredAt
      ? { label: 'Delivered', state: 'done', detail: formatTime(trip.deliveredAt), mono: true }
      : { label: 'Delivered', state: 'upcoming', detail: `By ${formatTime(trip.deliverBy)}`, mono: false },
  ];
}

function StepDot({ state }: { state: StepState }) {
  if (state === 'done') {
    return (
      <View style={[styles.dot, styles.dotDone]}>
        <Check size={sizes.iconXs - 3} color={colors.surface} strokeWidth={3} />
      </View>
    );
  }
  if (state === 'current') {
    return (
      <View style={[styles.dot, styles.dotCurrent]}>
        <View style={styles.dotCore} />
      </View>
    );
  }
  return <View style={[styles.dot, styles.dotUpcoming]} />;
}

const labelColor: Record<StepState, string> = { done: colors.text, current: colors.accent, upcoming: colors.muted };

/** Trip started → Cargo picked up → Delivered, with times. Stops and times only — no map or ETA. */
export function TripProgressCard({ trip }: { trip: Trip }) {
  const steps = stepsFor(trip);
  const summary = steps.map((step) => `${step.label}: ${step.state === 'done' ? `done ${step.detail}` : step.detail}`);

  return (
    <Card style={styles.card}>
      <View style={styles.track} accessible accessibilityLabel={`Trip progress. ${summary.join('. ')}.`}>
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            {index > 0 ? <View style={[styles.line, step.state !== 'upcoming' && styles.lineDone]} /> : null}
            <StepDot state={step.state} />
          </Fragment>
        ))}
      </View>
      <View style={styles.labels} importantForAccessibility="no-hide-descendants">
        {steps.map((step) => (
          <View key={step.label} style={styles.label}>
            <Text
              style={[
                typography.stepLabel,
                step.state === 'upcoming' && styles.upcomingLabel,
                { color: labelColor[step.state] },
              ]}
              numberOfLines={1}>
              {step.label}
            </Text>
            <Text style={step.mono ? typography.monoMicro : typography.micro}>{step.detail}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const LABEL_WIDTH = 100;

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  // Dots sit centred over the 100 px labels below them.
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: (LABEL_WIDTH - sizes.progressDot) / 2,
  },
  line: {
    flex: 1,
    height: sizes.progressLine,
    backgroundColor: colors.border,
  },
  lineDone: {
    backgroundColor: colors.success,
  },
  dot: {
    width: sizes.progressDot,
    height: sizes.progressDot,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  dotCurrent: {
    borderWidth: sizes.selectedBorder,
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  dotCore: {
    width: sizes.progressDotCore,
    height: sizes.progressDotCore,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  dotUpcoming: {
    borderWidth: sizes.selectedBorder,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    width: LABEL_WIDTH,
    alignItems: 'center',
    gap: 1,
  },
  upcomingLabel: {
    fontFamily: typography.label.fontFamily,
  },
});
