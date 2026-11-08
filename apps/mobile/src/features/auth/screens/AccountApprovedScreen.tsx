import { useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState, InfoBanner, KeyboardAwareScroll, PasswordRules, TextField } from '@/components/ui';
import { formatDayMonth } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { ApprovalSteps } from '../components/ApprovalSteps';
import { DetailRow } from '../components/DetailRow';
import { ROLE_LABELS, STAFF_ID_LABELS } from '../constants';
import { useAccountApproval } from '../hooks/useAccountApproval';

/**
 * Figma "Mobile — Account approved (Driver & Mechanic)". In the real app this opens from the
 * link in the approval email; the user creates a password and is signed in.
 */
export function AccountApprovedScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const state = useAccountApproval(requestId);
  const { approval } = state;

  if (state.isLoading) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <ActivityIndicator color={colors.accent} accessibilityLabel="Loading your account" />
      </SafeAreaView>
    );
  }

  if (!approval) {
    return (
      <SafeAreaView style={[styles.screen, styles.centered]}>
        <EmptyState
          title="Couldn’t load your account"
          description={state.loadError ?? 'Please try again.'}
          action={{ label: 'Try again', onPress: state.retry }}
        />
      </SafeAreaView>
    );
  }

  const firstName = approval.fullName.split(' ')[0];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <Check size={26} color={colors.success} strokeWidth={2.5} />
          </View>
          <View style={styles.headerText}>
            <Text style={typography.title} accessibilityRole="header">
              Request approved
            </Text>
            <Text style={[typography.body, styles.muted]}>Welcome to the fleet, {firstName}</Text>
          </View>
        </View>

        <ApprovalSteps
          steps={[
            { label: 'Sent', date: formatDayMonth(approval.sentAt) },
            { label: 'Reviewed', date: formatDayMonth(approval.reviewedAt) },
            { label: 'Approved', date: formatDayMonth(approval.approvedAt) },
          ]}
        />

        <View style={styles.account}>
          <Text style={typography.sectionLabel}>Your account</Text>
          <DetailRow label="Role" value={ROLE_LABELS[approval.role]} />
          <DetailRow label={STAFF_ID_LABELS[approval.role]} value={approval.staffId} mono />
          <DetailRow label="Depot (assigned)" value={approval.depot} />
          <DetailRow label="Sign-in email" value={approval.signInEmail} />
          <DetailRow label="Approved by" value={approval.approvedBy} />
        </View>

        <Text style={[typography.cardTitle, styles.sectionTitle]}>Create your password</Text>
        <TextField
          label="New password"
          value={state.values.password}
          onChangeText={(text) => state.setField('password', text)}
          error={state.errors.password}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <TextField
          label="Confirm password"
          value={state.values.confirmPassword}
          onChangeText={(text) => state.setField('confirmPassword', text)}
          error={state.errors.confirmPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={state.activate}
        />
        <PasswordRules checks={state.passwordChecks} />

        {state.submitError ? (
          <InfoBanner tone="danger" title="Couldn’t activate your account" message={state.submitError} />
        ) : null}

        <View style={styles.spacer} />

        <Button label="Activate account and sign in" onPress={state.activate} loading={state.submitting} />
        <Text style={[typography.caption, styles.center]}>This link from your approval email works for 48 hours.</Text>
      </KeyboardAwareScroll>
    </SafeAreaView>
  );
}

const ICON_SIZE = 56;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.huge,
  },
  body: {
    padding: spacing.huge,
    gap: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: colors.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: spacing.xxs,
  },
  muted: {
    color: colors.muted,
  },
  account: {
    gap: spacing.ml,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    borderRadius: radii.card,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
  },
  sectionTitle: {
    lineHeight: undefined,
  },
  spacer: {
    flexGrow: 1,
  },
  center: {
    textAlign: 'center',
  },
});
