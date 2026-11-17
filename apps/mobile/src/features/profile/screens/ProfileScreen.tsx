import { router, useLocalSearchParams } from 'expo-router';
import { CircleX, LockKeyhole, Pencil } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, InfoBanner, StatusBadge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSettingsCard } from '@/features/notifications';
import { formatDayMonth, formatFullDate, formatTime } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { DetailRow } from '../components/DetailRow';
import { DetailsCard } from '../components/DetailsCard';
import { LicenceAlert } from '../components/LicenceAlert';
import { LinkRow } from '../components/LinkRow';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { SignOutButton } from '../components/SignOutButton';
import { useProfile } from '../hooks/useProfile';
import { isLicenceExpiring, parseIsoDate } from '../licence';

/** Route param set by Change password when it returns here. */
export const PASSWORD_UPDATED_NOTICE = 'password-updated';

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

/** "Today, 07:52" or "12 Nov, 07:52". */
function dayAndTime(iso: string) {
  return `${isToday(iso) ? 'Today' : formatDayMonth(iso)}, ${formatTime(iso)}`;
}

function requestChange() {
  // No mobile frame for a change request form yet.
  Alert.alert('Request a change', 'To change these details, contact your Fleet Administrator.');
}

/**
 * Driver — Profile (Figma 219:6777) with its states: Licence expiring (417:14707) and
 * Password updated (456:11285).
 */
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { profile, isLoading, loadError, refreshError, retry } = useProfile();
  const { notice, changedAt } = useLocalSearchParams<{ notice?: string; changedAt?: string }>();
  const passwordUpdated = notice === PASSWORD_UPDATED_NOTICE;

  function renderBody() {
    if (isLoading) return <ProfileSkeleton />;
    if (!profile || !user) {
      return (
        <EmptyState
          icon={CircleX}
          tone="danger"
          title="Couldn’t load your profile"
          description={loadError ?? undefined}
          action={{ label: 'Retry', onPress: retry }}
        />
      );
    }

    const { licence, pendingRenewal } = profile;
    const expiring = isLicenceExpiring(licence.expiresOn);

    return (
      <>
        <ProfileHeader user={user} profile={profile} />

        {refreshError ? <InfoBanner tone="danger" size="sm" title="Couldn’t refresh" message={refreshError} /> : null}

        {pendingRenewal ? (
          <InfoBanner
            tone="info"
            title="Renewed licence sent for review"
            message={`New expiry ${formatFullDate(parseIsoDate(pendingRenewal.newExpiresOn))}. A Fleet Administrator will check your photos. Your current licence stays on file until then.`}
          />
        ) : expiring ? (
          <LicenceAlert expiresOn={licence.expiresOn} onUpload={() => router.push('/driver/profile/renew-licence')} />
        ) : null}

        <DetailsCard title="Personal details" description="Changes are sent to a Fleet Administrator for approval.">
          <DetailRow label="Mobile" value={profile.mobile} />
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Address" value={profile.address} />
          <LinkRow label="Request a change" icon={Pencil} variant="accent" onPress={requestChange} />
        </DetailsCard>

        <DetailsCard title="Work details" description="Set by the Fleet Administrator.">
          <DetailRow label="Licence no." value={licence.number} mono />
          <DetailRow label="Licence class" value={licence.className} />
          <DetailRow
            label="Licence expires"
            value={formatFullDate(parseIsoDate(licence.expiresOn))}
            warning={expiring && !pendingRenewal}
          />
          <DetailRow label="Depot" value={user.depot} divider={false} />
        </DetailsCard>

        <DetailsCard title="My change requests">
          {profile.changeRequests.length === 0 ? (
            <Text style={[typography.body, styles.empty]}>No change requests yet.</Text>
          ) : (
            profile.changeRequests.map((request, index) => (
              <DetailRow
                key={request.id}
                label={`${request.title} · ${formatDayMonth(request.sentAt)}`}
                value={<StatusBadge label={request.status} />}
                divider={index < profile.changeRequests.length - 1}
              />
            ))
          )}
        </DetailsCard>

        <DetailsCard title="Sign-in & security">
          <LinkRow
            label="Change password"
            icon={LockKeyhole}
            onPress={() => router.push('/driver/profile/change-password')}
            meta={passwordUpdated && changedAt ? `Changed ${dayAndTime(changedAt).toLowerCase()}` : undefined}
            divider
          />
          <DetailRow
            label="Last sign-in"
            value={`${dayAndTime(profile.lastSignIn.at)} · ${profile.lastSignIn.device}`}
            divider={false}
          />
        </DetailsCard>

        <NotificationSettingsCard />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      {/* White strip behind the status bar, as in the frame. */}
      <View style={[styles.statusBar, { height: insets.top }]} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={typography.screenTitle} accessibilityRole="header">
          Profile
        </Text>
        {passwordUpdated ? (
          <InfoBanner
            tone="success"
            size="sm"
            title="Password updated"
            message="You are still signed in on this phone. Other devices were signed out."
          />
        ) : null}
        {renderBody()}
        {/* Always available, even when the profile fails to load. Signing out returns to Sign in via the route guards. */}
        <SignOutButton onPress={signOut} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusBar: {
    backgroundColor: colors.surface,
  },
  body: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  empty: {
    color: colors.muted,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
});
