import { router, useLocalSearchParams } from 'expo-router';
import { CircleX, SearchX } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionBar, EmptyState, InfoBanner, ScreenHeader, StatusBadge } from '@/components/ui';
import { formatDate, formatDistance, formatTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { CargoCard } from '../components/CargoCard';
import { PeopleCard } from '../components/PeopleCard';
import { RouteCard } from '../components/RouteCard';
import { TripDetailsSkeleton } from '../components/TripDetailsSkeleton';
import { useTrip } from '../hooks/useTrip';
import { tripStartHref, tripStepHref } from '../routes';
import { canStartTrip, isActiveTrip, isSameDay, tripBadgeLabel } from '../tripStatus';
import type { Trip } from '../types';

/** "Today · 09:30 – 12:00 · 38 km", or "Wed 22 Oct · 07:00 – 10:30 · 94 km" for a later day. */
function tripSubtitle(trip: Trip, now: Date) {
  const day = isSameDay(trip.scheduledStart, now) ? 'Today' : formatDate(trip.scheduledStart, 'short');
  return `${day} · ${formatTime(trip.scheduledStart)} – ${formatTime(trip.deliverBy)} · ${formatDistance(trip.distanceKm)}`;
}

/** "Delivered at 11:22 · ending odometer 84,274 km". */
function completedMessage(completedAt: string, endOdometerKm: number | undefined) {
  const odometer = endOdometerKm === undefined ? '' : ` · ending odometer ${formatDistance(endOdometerKm)}`;
  return `Delivered at ${formatTime(completedAt)}${odometer}. The coordinator and the customer can see it.`;
}

/** Driver — Trip details (Figma 169:6500). Opened from Home: "View trip details" or an upcoming trip. */
export function TripDetailsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry } = useTrip(tripId);

  if (state.kind !== 'loaded') {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={tripId ?? 'Trip'} monoTitle />
        <ScrollView contentContainerStyle={styles.body}>
          {state.kind === 'loading' ? <TripDetailsSkeleton /> : null}
          {state.kind === 'notFound' ? (
            <EmptyState
              icon={SearchX}
              title="Trip not found"
              description="This trip doesn’t exist or isn’t assigned to you any more."
              action={{ label: 'Back to Home', variant: 'secondary', onPress: () => router.navigate('/driver/home') }}
            />
          ) : null}
          {state.kind === 'error' ? (
            <EmptyState
              icon={CircleX}
              tone="danger"
              title="Couldn’t load this trip"
              description={state.message}
              action={{ label: 'Retry', onPress: retry }}
            />
          ) : null}
        </ScrollView>
      </View>
    );
  }

  const { trip, checkedAt } = state;
  // Start trip (Assigned, today) / Continue trip (mid-trip) / nothing (view only: completed, cancelled, later day).
  const showStart = canStartTrip(trip, checkedAt);
  const showContinue = isActiveTrip(trip);

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title={trip.id}
        monoTitle
        subtitle={tripSubtitle(trip, checkedAt)}
        right={<StatusBadge label={tripBadgeLabel(trip.status)} />}
      />
      <ScrollView contentContainerStyle={styles.body}>
        {trip.status === 'Completed' && trip.completedAt ? (
          <InfoBanner
            tone="success"
            title="Trip completed"
            message={completedMessage(trip.completedAt, trip.endOdometerKm)}
          />
        ) : null}
        {trip.status === 'Cancelled' ? (
          <InfoBanner
            tone="danger"
            title="Trip cancelled"
            message="The coordinator cancelled this trip. There is nothing more to do on it."
          />
        ) : null}
        <RouteCard trip={trip} />
        <CargoCard trip={trip} />
        <PeopleCard trip={trip} />
      </ScrollView>
      {showStart ? (
        <ActionBar
          label="Start trip"
          hint="You will enter the starting odometer reading next."
          onPress={() => router.push(tripStartHref(trip.id))}
        />
      ) : null}
      {showContinue ? (
        <ActionBar
          label="Continue trip"
          hint="Pick up where you left off."
          onPress={() => router.push(tripStepHref(trip))}
        />
      ) : null}
    </View>
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
});
