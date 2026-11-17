import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ActionBar,
  appendOdometerDigit,
  InfoBanner,
  NumericKeypad,
  OdometerDisplay,
  OdometerStatus,
  ScreenHeader,
} from '@/components/ui';
import { completeTrip, tripHref, useTripAction, VehicleOdometerCard, type Trip } from '@/features/trips';
import { formatDistance } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { podTripSubtitle } from '../tripSubtitle';
import { validateEndOdometer } from '../validation';
import { TripSummaryTiles } from './TripSummaryTiles';

type CompleteTripFormProps = {
  trip: Trip;
  /** Reload the trip (the coordinator cancelled it meanwhile). */
  onCancelled: () => void;
};

/**
 * Driver — Complete trip (Figma 173:6655): ending odometer on the keypad for a Delivered trip (proof of
 * delivery already sent). On success the trip is Completed and the driver goes back to Trip details.
 */
export function CompleteTripForm({ trip, onCancelled }: CompleteTripFormProps) {
  const [digits, setDigits] = useState('');
  // Keeps the button loading while the screen animates away after a successful submit.
  const [completed, setCompleted] = useState(false);
  const [now] = useState(() => new Date());
  const odometerError = validateEndOdometer(digits, trip.startOdometerKm);

  const { state: submitState, run } = useTripAction(
    () => completeTrip(trip.id, { endOdometerKm: Number(digits), completedAt: new Date().toISOString() }),
    () => {
      setCompleted(true);
      router.dismissTo(tripHref(trip.id));
    },
    onCancelled,
  );
  const isSubmitting = submitState.kind === 'submitting' || completed;

  const startHint =
    trip.startOdometerKm !== undefined ? ` It must be more than ${formatDistance(trip.startOdometerKm)}.` : '';
  const driven =
    trip.startOdometerKm !== undefined ? `${formatDistance(Number(digits) - trip.startOdometerKm)} driven on this trip` : undefined;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Complete trip" subtitle={podTripSubtitle(trip)} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <VehicleOdometerCard vehicle={trip.vehicle} readingLabel="Started at" readingKm={trip.startOdometerKm} />

        <View style={styles.odometer}>
          <Text style={typography.bodyStrong} accessibilityRole="header">
            Ending odometer reading
          </Text>
          <OdometerDisplay
            digits={digits}
            invalid={digits !== '' && odometerError !== undefined}
            label="Ending odometer reading"
          />
          {digits ? <OdometerStatus error={odometerError} success={driven} /> : null}
          <Text style={typography.captionLong}>
            Read the number on the dashboard after delivery.{startHint}
          </Text>
        </View>

        <TripSummaryTiles trip={trip} now={now} />

        {submitState.kind === 'error' ? (
          <InfoBanner
            tone="danger"
            title="Couldn’t complete the trip"
            message={`${submitState.message} Nothing you entered was lost.`}
          />
        ) : null}

        <View style={styles.spacer} />

        <NumericKeypad
          onDigit={(digit) => setDigits((current) => appendOdometerDigit(current, digit))}
          onBackspace={() => setDigits((current) => current.slice(0, -1))}
          onClear={() => setDigits('')}
          disabled={isSubmitting}
        />
      </ScrollView>

      <ActionBar
        label={submitState.kind === 'error' ? 'Try again' : 'Confirm and complete trip'}
        onPress={run}
        disabled={odometerError !== undefined}
        loading={isSubmitting}
        hint="The trip is marked Completed for the coordinator and the customer."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  odometer: {
    gap: spacing.md,
  },
  spacer: {
    flex: 1,
  },
});
