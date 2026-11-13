import { router } from 'expo-router';
import { CircleX, Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { ActionBar, EmptyState, InfoBanner, KeyboardAwareScroll, PhotoField, ScreenHeader, TextField } from '@/components/ui';
import { formatFullDate, formatTime } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { ProfileSkeleton } from '../components/ProfileSkeleton';
import { useProfile } from '../hooks/useProfile';
import { useRenewLicence } from '../hooks/useRenewLicence';
import { parseIsoDate, RENEWAL_PHOTO_COUNT } from '../licence';
import type { DriverProfile } from '../types';

const NEXT_STEPS = [
  'A Fleet Administrator checks the photos.',
  'They update your licence number, type and expiry.',
  'You get a notification when it is approved.',
];

/** Driver — Upload renewed licence (Figma 417:14831), opened from the licence banner on Profile. */
export function RenewLicenceScreen() {
  const { profile, isLoading, loadError, retry } = useProfile();
  const subtitle = profile
    ? `Current licence expires ${formatFullDate(parseIsoDate(profile.licence.expiresOn))}`
    : undefined;

  function renderBody() {
    if (isLoading) {
      return (
        <View style={styles.padded}>
          <ProfileSkeleton />
        </View>
      );
    }
    if (!profile) {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={CircleX}
            tone="danger"
            title="Couldn’t load your licence"
            description={loadError ?? undefined}
            action={{ label: 'Retry', onPress: retry }}
          />
        </View>
      );
    }
    if (profile.pendingRenewal) {
      return (
        <View style={styles.padded}>
          <EmptyState
            icon={Clock}
            tone="pending"
            title="Already sent for review"
            description="A Fleet Administrator is checking your renewed licence. You get a notification when it is approved."
            action={{ label: 'Back to profile', onPress: () => router.back() }}
          />
        </View>
      );
    }
    return <RenewLicenceForm profile={profile} />;
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Upload renewed licence" subtitle={subtitle} />
      {renderBody()}
    </View>
  );
}

function RenewLicenceForm({ profile }: { profile: DriverProfile }) {
  const form = useRenewLicence(profile.licence.expiresOn);
  const isFront = form.photos.length === 0;

  return (
    <>
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <View style={styles.photos}>
          <PhotoField
            title="Photos of your new licence"
            meta={`${form.photos.length} of ${RENEWAL_PHOTO_COUNT} added`}
            photos={form.photos}
            onChange={form.setPhotos}
            max={RENEWAL_PHOTO_COUNT}
            photoLabel={(photo, position) => `${position === 1 ? 'Front' : 'Back'} · ${formatTime(photo.capturedAt)}`}
            addLabel={isFront ? 'Add front' : 'Add back'}
            prompt={{
              title: isFront ? 'Front of your licence' : 'Back of your licence',
              message: 'Make sure all four corners are visible and the text is sharp.',
            }}
          />
          {form.errors.photos ? (
            <View style={styles.error} accessibilityRole="alert">
              <CircleX size={sizes.iconXs} color={colors.danger} />
              <Text style={typography.caption}>{form.errors.photos}</Text>
            </View>
          ) : form.photos.length > 0 ? (
            <Text style={typography.caption}>Tap a photo to remove it and take it again.</Text>
          ) : null}
        </View>

        <TextField
          label="New expiry date"
          placeholder="DD/MM/YYYY"
          value={form.expiry}
          onChangeText={form.setExpiry}
          error={form.errors.expiry}
          helper="As printed on your new licence"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          returnKeyType="done"
        />

        <View style={styles.steps}>
          <Text style={typography.bodyStrong}>What happens next</Text>
          {NEXT_STEPS.map((step, index) => (
            <Text key={step} style={typography.meta}>
              {index + 1}
              {'  '}
              {step}
            </Text>
          ))}
        </View>

        <Text style={typography.captionLong}>
          Make sure all four corners are visible and the text is sharp. Avoid glare from the plastic cover.
        </Text>

        {form.submitError ? (
          <InfoBanner tone="danger" title="Couldn’t send your licence" message={form.submitError} />
        ) : null}
      </KeyboardAwareScroll>
      <ActionBar
        label="Send for review"
        onPress={form.submit}
        loading={form.submitting}
        hint="Your current licence stays on file until the new one is approved."
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    padding: spacing.xxl,
  },
  body: {
    gap: spacing.xxxl - spacing.xxs,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  photos: {
    gap: spacing.md,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  steps: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderRadius: radii.tile,
  },
});
