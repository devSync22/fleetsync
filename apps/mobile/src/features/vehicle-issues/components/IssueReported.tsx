import { router } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ActionBar, EmptyState, InfoBanner, ScreenHeader } from '@/components/ui';
import type { Trip } from '@/features/trips';
import { colors, spacing } from '@/theme';

import { issueHeaderSubtitle, notifiedPeople } from '../notifiedPeople';
import type { VehicleIssue } from '../types';

/** Shown after Send report: what was sent and who was told. The trip carries on as before. */
export function IssueReported({ trip, issue }: { trip: Trip; issue: VehicleIssue }) {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Report vehicle issue" subtitle={issueHeaderSubtitle(trip)} />
      <ScrollView contentContainerStyle={styles.body}>
        <EmptyState
          icon={CircleCheck}
          tone="success"
          title="Report sent"
          description={`${issue.type} · ${issue.vehiclePlate}. Sent to ${notifiedPeople(trip)}. The report is on the vehicle’s issue list for the mechanic.`}
        />
        {issue.severity === 'Stopped' ? (
          <InfoBanner
            tone="pending"
            title="Stay with the vehicle"
            message="The coordinator will contact you about help or another vehicle."
          />
        ) : null}
      </ScrollView>
      <ActionBar label="Back to trip" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
});
