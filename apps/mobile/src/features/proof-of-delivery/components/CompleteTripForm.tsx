import { router } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ActionBar, EmptyState, InfoBanner, ScreenHeader } from '@/components/ui';
import { proofOfDeliveryHref, tripHref, type Trip } from '@/features/trips';
import { formatDistance } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { ODOMETER_MAX_DIGITS } from '../constants';
import { usePodDraft } from '../hooks/usePodDraft';
import { useSubmitPod } from '../hooks/useSubmitPod';
import { podTripSubtitle } from '../tripSubtitle';
import type { PodDraft } from '../types';
import { isPodDetailsValid, validateEndOdometer } from '../validation';
import { NumericKeypad } from './NumericKeypad';
import { OdometerDisplay } from './OdometerDisplay';
import { OdometerStatus } from './OdometerStatus';
import { TripSummaryTiles } from './TripSummaryTiles';
import { VehicleOdometerCard } from './VehicleOdometerCard';

/**
 * Driver — Complete trip (Figma 173:6655): ending odometer on the keypad, then submit the proof of
 * delivery. On success the trip is Completed and the driver goes back to Trip details.
 */
export function CompleteTripForm({ trip }: { trip: Trip }) {
  const { draft, hasDraft, update, clear } = usePodDraft(trip.id);
  // Keeps the screen as it was while it animates away after a successful submit (the draft is cleared).
  const [submittedDraft, setSubmittedDraft] = useState<PodDraft | null>(null);
  const [now] = useState(() => new Date());
  const { state: submitState, submit } = useSubmitPod(() => {
    setSubmittedDraft(draft);
    clear();
    router.dismissTo(tripHref(trip.id));
  });

  const current = submittedDraft ?? draft;
  const isSubmitting = submitState.kind === 'submitting' || submittedDraft !== null;

  if (!submittedDraft && (!hasDraft || !isPodDetailsValid(current))) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title="Complete trip" subtitle={podTripSubtitle(trip)} />
        <ScrollView contentContainerStyle={styles.body}>
          <EmptyState
            icon={ClipboardList}
            tone="pending"
            title="Add proof of delivery first"
            description="Add the delivery photos, who received the cargo and their signature before you complete the trip."
            action={{ label: 'Add proof of delivery', onPress: () => router.replace(proofOfDeliveryHref(trip.id)) }}
          />
        </ScrollView>
      </View>
    );
  }

  const digits = current.endOdometerDigits;
  const odometerError = validateEndOdometer(digits, trip.startOdometerKm);

  function pressDigit(digit: string) {
    if (digits.length >= ODOMETER_MAX_DIGITS || (digits === '' && digit === '0')) return;
    update({ endOdometerDigits: digits + digit });
  }

  function handleSubmit() {
    if (odometerError) return;
    submit({
      tripId: trip.id,
      recipientName: current.recipientName.trim(),
      cargoCondition: current.cargoCondition,
      photos: current.photos,
      signature: current.signature,
      endOdometerKm: Number(digits),
      notes: current.notes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    });
  }

  const startHint =
    trip.startOdometerKm !== undefined ? ` It must be more than ${formatDistance(trip.startOdometerKm)}.` : '';

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Complete trip" subtitle={podTripSubtitle(trip)} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <VehicleOdometerCard trip={trip} />

        <View style={styles.odometer}>
          <Text style={typography.bodyStrong} accessibilityRole="header">
            Ending odometer reading
          </Text>
          <OdometerDisplay digits={digits} invalid={digits !== '' && odometerError !== undefined} />
          <OdometerStatus digits={digits} error={odometerError} startOdometerKm={trip.startOdometerKm} />
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
          onDigit={pressDigit}
          onBackspace={() => update({ endOdometerDigits: digits.slice(0, -1) })}
          onClear={() => update({ endOdometerDigits: '' })}
          disabled={isSubmitting}
        />
      </ScrollView>

      <ActionBar
        label={submitState.kind === 'error' ? 'Try again' : 'Confirm and complete trip'}
        onPress={handleSubmit}
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
