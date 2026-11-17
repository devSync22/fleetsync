import { router, useLocalSearchParams } from 'expo-router';
import { MessageSquare, Pencil, TriangleAlert } from 'lucide-react-native';
import { useRef, type ComponentRef } from 'react';
import { StyleSheet, View, type TextInput } from 'react-native';

import { ActionBar, InfoBanner, KeyboardAwareScroll, ScreenHeader, StatusBadge } from '@/components/ui';
import { chatRoomHref } from '@/features/chat';
import { formatDistance, formatTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { ActionTile } from '../components/ActionTile';
import { ActiveCargoCard } from '../components/ActiveCargoCard';
import { ActiveStopCard } from '../components/ActiveStopCard';
import { TripGate } from '../components/TripGate';
import { TripNotesCard } from '../components/TripNotesCard';
import { TripProgressCard } from '../components/TripProgressCard';
import { useTrip } from '../hooks/useTrip';
import { completeTripHref, pickedUpHref, proofOfDeliveryHref, reportIssueHref } from '../routes';
import { isActiveTrip, tripBadgeLabel } from '../tripStatus';
import type { Trip } from '../types';

/** How often an open Active trip checks whether the coordinator cancelled it. */
const CANCEL_CHECK_MS = 10_000;

/** "Started 09:41 · 84,236 km". */
function startedSubtitle(trip: Trip) {
  if (!trip.startedAt) return undefined;
  const odometer = trip.startOdometerKm === undefined ? '' : ` · ${formatDistance(trip.startOdometerKm)}`;
  return `Started ${formatTime(trip.startedAt)}${odometer}`;
}

/** Bottom action for the trip's step (frames: "Cargo picked up", "Complete trip"). */
function primaryAction(trip: Trip) {
  if (trip.status === 'Cancelled') {
    return { label: 'Back to Home', hint: undefined, onPress: () => router.navigate('/driver/home') };
  }
  if (trip.status === 'Started') {
    return {
      label: 'Cargo picked up',
      hint: 'Tap when all the cargo is loaded. The coordinator and customer will see it.',
      onPress: () => router.push(pickedUpHref(trip.id)),
    };
  }
  if (trip.status === 'Delivered') {
    return {
      label: 'Complete trip',
      hint: 'Proof of delivery is sent. Enter the ending odometer to finish.',
      onPress: () => router.push(completeTripHref(trip.id)),
    };
  }
  return {
    label: 'Complete trip',
    hint: 'Tap when the cargo is delivered. You will enter the ending odometer.',
    onPress: () => router.push(proofOfDeliveryHref(trip.id)),
  };
}

function ActiveTripView({ trip, reload }: { trip: Trip; reload: () => void }) {
  const noteInput = useRef<ComponentRef<typeof TextInput>>(null);
  const isCancelled = trip.status === 'Cancelled';
  const action = primaryAction(trip);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={trip.id}
        monoTitle
        subtitle={startedSubtitle(trip)}
        showBack={false}
        right={<StatusBadge label={tripBadgeLabel(trip.status)} />}
      />
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        {isCancelled ? (
          <InfoBanner
            tone="danger"
            title="Trip cancelled by the coordinator"
            message="Stop here — there is nothing more to do on this trip. Contact the coordinator if you have the cargo."
          />
        ) : null}

        <TripProgressCard trip={trip} />
        <ActiveStopCard trip={trip} stop={trip.status === 'Started' ? 'pickup' : 'destination'} disabled={isCancelled} />

        {isCancelled ? null : (
          <View style={styles.tiles}>
            <ActionTile label="Add note" icon={Pencil} tone="accent" onPress={() => noteInput.current?.focus()} />
            <ActionTile
              label="Report issue"
              icon={TriangleAlert}
              tone="danger"
              onPress={() => router.push(reportIssueHref(trip.id))}
            />
            <ActionTile
              label="Chat"
              icon={MessageSquare}
              tone="info"
              onPress={() => router.navigate(chatRoomHref('driver', trip.orderId))}
            />
          </View>
        )}

        <TripNotesCard trip={trip} inputRef={noteInput} canAdd={!isCancelled} onChanged={reload} />
        <ActiveCargoCard trip={trip} />
      </KeyboardAwareScroll>

      <ActionBar label={action.label} hint={action.hint} onPress={action.onPress} />
    </View>
  );
}

/**
 * Driver — Active trip: "to pickup" (Figma 400:8154) while Started, "in progress" (171:6516) after the
 * cargo is picked up. Stops and times only — no map, GPS or ETA. Shows a banner if the trip is cancelled.
 */
export function ActiveTripScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId, { pollMs: CANCEL_CHECK_MS });

  return (
    <TripGate
      title={tripId ?? 'Trip'}
      tripId={tripId}
      state={state}
      retry={retry}
      // A trip cancelled mid-trip stays on this screen with the banner.
      allows={(trip) => isActiveTrip(trip) || (trip.status === 'Cancelled' && trip.startedAt !== undefined)}>
      {(trip) => <ActiveTripView trip={trip} reload={reload} />}
    </TripGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  tiles: {
    flexDirection: 'row',
    gap: spacing.ml,
  },
});
