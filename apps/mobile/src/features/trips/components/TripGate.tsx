import { router } from 'expo-router';
import { Ban, CircleCheck, CircleX, Clock, SearchX } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ScreenHeader } from '@/components/ui';
import { formatTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

import type { TripState } from '../hooks/useTrip';
import { tripHref, tripStepHref } from '../routes';
import { isActiveTrip } from '../tripStatus';
import type { Trip } from '../types';
import { TripDetailsSkeleton } from './TripDetailsSkeleton';

type TripGateProps = {
  /** Header title while the step isn't shown — "Start trip". */
  title: string;
  tripId: string | undefined;
  state: TripState;
  retry: () => void;
  /** Whether this step's screen can be shown for the trip's current status. */
  allows: (trip: Trip, checkedAt: Date) => boolean;
  /** Loading placeholder shaped like the screen; defaults to the Trip details skeleton. */
  skeleton?: ReactNode;
  children: (trip: Trip, checkedAt: Date) => ReactNode;
};

const goHome = () => router.navigate('/driver/home');

/** What to show for a loaded trip that isn't at this step (already done, cancelled, not started…). */
function WrongStep({ trip }: { trip: Trip }) {
  if (trip.status === 'Cancelled') {
    return (
      <EmptyState
        icon={Ban}
        tone="danger"
        title="Trip cancelled"
        description="The coordinator cancelled this trip. There is nothing more to do on it."
        action={{ label: 'Back to Home', onPress: goHome }}
      />
    );
  }
  if (trip.status === 'Completed') {
    return (
      <EmptyState
        icon={CircleCheck}
        tone="success"
        title="Trip already completed"
        description={trip.completedAt ? `Completed at ${formatTime(trip.completedAt)}.` : undefined}
        action={{ label: 'View trip', variant: 'secondary', onPress: () => router.dismissTo(tripHref(trip.id)) }}
      />
    );
  }
  if (isActiveTrip(trip)) {
    return (
      <EmptyState
        icon={Clock}
        tone="pending"
        title="This step is already done"
        description="Continue the trip from where you left off."
        action={{ label: 'Continue trip', onPress: () => router.replace(tripStepHref(trip)) }}
      />
    );
  }
  return (
    <EmptyState
      icon={Clock}
      tone="pending"
      title="Trip not started"
      description="Start the trip from Home on the day it’s scheduled."
      action={{ label: 'View trip', variant: 'secondary', onPress: () => router.dismissTo(tripHref(trip.id)) }}
    />
  );
}

/**
 * Wraps a trip-flow screen: shows loading, not found, load error, or "wrong step" (cancelled, completed,
 * already done, not started) — and the screen itself only when `allows` says the trip is at this step.
 */
export function TripGate({ title, tripId, state, retry, allows, skeleton, children }: TripGateProps) {
  if (state.kind === 'loaded' && allows(state.trip, state.checkedAt)) {
    return <>{children(state.trip, state.checkedAt)}</>;
  }

  function renderContent() {
    switch (state.kind) {
      case 'loading':
        return skeleton ?? <TripDetailsSkeleton />;
      case 'notFound':
        return (
          <EmptyState
            icon={SearchX}
            title="Trip not found"
            description="This trip doesn’t exist or isn’t assigned to you any more."
            action={{ label: 'Back to Home', variant: 'secondary', onPress: goHome }}
          />
        );
      case 'error':
        return (
          <EmptyState
            icon={CircleX}
            tone="danger"
            title="Couldn’t load this trip"
            description={state.message}
            action={{ label: 'Retry', onPress: retry }}
          />
        );
      case 'loaded':
        return <WrongStep trip={state.trip} />;
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={title} subtitle={tripId} />
      <ScrollView contentContainerStyle={styles.body}>{renderContent()}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
});
