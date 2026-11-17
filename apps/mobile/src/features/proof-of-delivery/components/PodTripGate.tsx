import { router } from 'expo-router';
import { CircleCheck, CircleX, Clock, SearchX } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ScreenHeader } from '@/components/ui';
import { tripHref, type TripState } from '@/features/trips';
import { formatTime } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { PodSkeleton } from './PodSkeleton';

type PodTripGateProps = {
  title: string;
  tripId: string | undefined;
  state: TripState;
  retry: () => void;
};

/**
 * Everything the proof-of-delivery screens show instead of the form: loading, trip not found,
 * load error, or a trip that isn't In progress (not started yet, or already completed).
 */
export function PodTripGate({ title, tripId, state, retry }: PodTripGateProps) {
  const backToTrip = () => router.dismissTo(tripHref(tripId ?? ''));

  function renderContent() {
    switch (state.kind) {
      case 'loading':
        return <PodSkeleton />;
      case 'notFound':
        return (
          <EmptyState
            icon={SearchX}
            title="Trip not found"
            description="This trip doesn’t exist or isn’t assigned to you any more."
            action={{ label: 'Back to Home', variant: 'secondary', onPress: () => router.navigate('/driver/home') }}
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
        if (state.trip.status === 'Completed') {
          return (
            <EmptyState
              icon={CircleCheck}
              tone="success"
              title="Trip already completed"
              description={
                state.trip.completedAt
                  ? `Proof of delivery was sent at ${formatTime(state.trip.completedAt)}.`
                  : 'Proof of delivery has already been sent.'
              }
              action={{ label: 'View trip', variant: 'secondary', onPress: backToTrip }}
            />
          );
        }
        return (
          <EmptyState
            icon={Clock}
            tone="pending"
            title="Trip not in progress"
            description="You can add proof of delivery once the trip has started."
            action={{ label: 'Back to trip', variant: 'secondary', onPress: backToTrip }}
          />
        );
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
