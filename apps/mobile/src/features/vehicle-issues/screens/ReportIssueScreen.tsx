import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { isActiveTrip, TripGate, useTrip } from '@/features/trips';

import { IssueReported } from '../components/IssueReported';
import { ReportIssueForm } from '../components/ReportIssueForm';
import type { VehicleIssue } from '../types';

/**
 * Driver — Report vehicle issue (Figma 173:6520), opened from "Report issue" on Active trip.
 * Only while the trip is active; reporting doesn't change the trip's status.
 */
export function ReportIssueScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { state, retry, reload } = useTrip(tripId);
  const [sent, setSent] = useState<VehicleIssue | null>(null);

  return (
    <TripGate
      title="Report vehicle issue"
      tripId={tripId}
      state={state}
      retry={retry}
      // Once sent, keep the success view even if the trip moves on meanwhile.
      allows={(trip) => sent !== null || isActiveTrip(trip)}>
      {(trip) =>
        sent ? (
          <IssueReported trip={trip} issue={sent} />
        ) : (
          <ReportIssueForm trip={trip} onSent={setSent} onCancelled={reload} />
        )
      }
    </TripGate>
  );
}
