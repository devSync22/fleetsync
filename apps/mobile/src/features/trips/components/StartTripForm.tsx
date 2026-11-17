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
import { formatDistance } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { useTripAction } from '../hooks/useTripAction';
import { activeTripHref } from '../routes';
import { startTrip } from '../services/tripsApi';
import type { Trip } from '../types';
import { validateStartOdometer } from '../validation';
import { VehicleOdometerCard } from './VehicleOdometerCard';

type StartTripFormProps = {
  trip: Trip;
  /** Reload the trip (the coordinator cancelled it meanwhile). */
  onCancelled: () => void;
};

/** Driver — Start trip (Figma 170:6514): starting odometer on the keypad, then Confirm and start trip. */
export function StartTripForm({ trip, onCancelled }: StartTripFormProps) {
  const [digits, setDigits] = useState('');
  const lastKm = trip.vehicle.lastOdometerKm;
  const error = validateStartOdometer(digits, lastKm);
  const { state, run } = useTripAction(
    () => startTrip(trip.id, { startOdometerKm: Number(digits), startedAt: new Date().toISOString() }),
    () => router.replace(activeTripHref(trip.id)),
    onCancelled,
  );
  const isSubmitting = state.kind === 'submitting';
  const moreThanLast = Number(digits) - lastKm;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Start trip" subtitle={`${trip.id} · ${trip.customerName}`} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <VehicleOdometerCard vehicle={trip.vehicle} readingLabel="Last reading" readingKm={lastKm} />

        <View style={styles.odometer}>
          <Text style={typography.bodyStrong} accessibilityRole="header">
            Starting odometer reading
          </Text>
          <OdometerDisplay digits={digits} invalid={digits !== '' && error !== undefined} label="Starting odometer reading" />
          {digits ? (
            <OdometerStatus
              error={error}
              success={
                moreThanLast === 0 ? 'Same as the last reading' : `${formatDistance(moreThanLast)} more than the last reading`
              }
            />
          ) : null}
          <Text style={typography.captionLong}>
            Read the number on the dashboard before you drive. It must be at least {formatDistance(lastKm)}.
          </Text>
        </View>

        {state.kind === 'error' ? (
          <InfoBanner tone="danger" title="Couldn’t start the trip" message={state.message} />
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
        label={state.kind === 'error' ? 'Try again' : 'Confirm and start trip'}
        onPress={run}
        disabled={error !== undefined}
        loading={isSubmitting}
        hint="Your coordinator and the customer will see the trip as In progress."
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
