import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { formatDateTime } from '@/lib/format';
import { colors, radii, spacing, typography } from '@/theme';

import { DetailRow } from '../components/DetailRow';
import { RequestTimeline } from '../components/RequestTimeline';
import { ROLE_LABELS } from '../constants';
import type { StaffRole } from '../types';

type RequestSentParams = {
  requestId?: string;
  role?: string;
  fullName?: string;
  sentAt?: string;
};

function isStaffRole(value: string | undefined): value is StaffRole {
  return value === 'driver' || value === 'mechanic';
}

/** Figma "Mobile — Request sent (Driver & Mechanic)". Receives the request from Request account. */
export function RequestSentScreen() {
  const params = useLocalSearchParams<RequestSentParams>();
  const { requestId, role, fullName, sentAt } = params;

  function backToSignIn() {
    router.dismissTo('/sign-in');
  }

  if (!requestId || !isStaffRole(role) || !fullName || !sentAt) {
    return (
      <SafeAreaView style={[styles.screen, styles.missing]}>
        <EmptyState
          title="Request not found"
          description="Open Request an account from the sign-in screen to send a request."
          action={{ label: 'Back to sign in', onPress: backToSignIn }}
        />
      </SafeAreaView>
    );
  }

  const firstName = fullName.split(' ')[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.icon}>
          <Check size={32} color={colors.success} strokeWidth={2.5} />
        </View>
        <Text style={typography.headline} accessibilityRole="header">
          Request sent
        </Text>
        <Text style={[typography.body, styles.message]}>
          Thanks, {firstName}. A Fleet Administrator will review your request. When it is approved you get an email
          with your sign-in details.
        </Text>

        <View style={styles.summary}>
          <DetailRow label="Request ID" value={requestId} mono />
          <DetailRow label="Role" value={ROLE_LABELS[role]} />
          <DetailRow label="Sent" value={formatDateTime(sentAt)} />
        </View>

        <RequestTimeline
          steps={[
            { title: 'Request sent', description: formatDateTime(sentAt, { withYear: false }), state: 'done' },
            {
              title: 'Under review',
              description: 'Usually within 2 working days',
              state: 'current',
              // Prototype link: in the real app the approval email opens this screen.
              onPress: () => router.push({ pathname: '/account-approved', params: { requestId } }),
            },
            { title: 'Account ready', description: 'You get an email with your sign-in details', state: 'upcoming' },
          ]}
        />

        <Button label="Back to sign in" onPress={backToSignIn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const ICON_SIZE = 72;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  missing: {
    justifyContent: 'center',
    padding: spacing.huge,
  },
  body: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: spacing.huge,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: colors.muted,
    textAlign: 'center',
  },
  summary: {
    alignSelf: 'stretch',
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radii.card,
    backgroundColor: colors.background,
  },
});
