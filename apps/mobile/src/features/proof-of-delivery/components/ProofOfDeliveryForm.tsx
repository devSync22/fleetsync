import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionBar, FormSection, InfoBanner, KeyboardAwareScroll, PhotoField, ScreenHeader, TextField } from '@/components/ui';
import { completeTripHref, type Trip } from '@/features/trips';
import { formatTime, formatWeight } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { MAX_POD_PHOTOS, POD_NOTES_MAX_LENGTH, RECIPIENT_NAME_MAX_LENGTH } from '../constants';
import { usePodDraft } from '../hooks/usePodDraft';
import { useSubmitPod } from '../hooks/useSubmitPod';
import { podTripSubtitle } from '../tripSubtitle';
import { isPodDetailsValid, validateRecipientName } from '../validation';
import { CargoConditionPicker } from './CargoConditionPicker';
import { SignaturePad } from './SignaturePad';

type ProofOfDeliveryFormProps = {
  trip: Trip;
  /** Reload the trip (the coordinator cancelled it meanwhile). */
  onCancelled: () => void;
};

/**
 * Driver — Proof of delivery (Figma 298:7417) once the cargo is picked up. Continue sends it (the trip
 * becomes Delivered), then Complete trip asks for the ending odometer.
 */
export function ProofOfDeliveryForm({ trip, onCancelled }: ProofOfDeliveryFormProps) {
  // "Received by" starts with the trip's receiver ("Pradeep Kumara"); the driver can change it.
  const { draft, update, clear } = usePodDraft(trip.id, trip.destination.contactName);
  const [nameTouched, setNameTouched] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const nameError = nameTouched ? validateRecipientName(draft.recipientName) : undefined;
  const canContinue = isPodDetailsValid(draft);

  const { state: submitState, submit } = useSubmitPod(() => {
    clear();
    router.replace(completeTripHref(trip.id));
  }, onCancelled);
  const isSubmitting = submitState.kind === 'submitting';

  function handleContinue() {
    if (!canContinue) return;
    submit({
      tripId: trip.id,
      recipientName: draft.recipientName.trim(),
      cargoCondition: draft.cargoCondition,
      photos: draft.photos,
      signature: draft.signature,
      notes: draft.notes.trim() || undefined,
      submittedAt: new Date().toISOString(),
    });
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Proof of delivery" subtitle={podTripSubtitle(trip)} />
      <KeyboardAwareScroll contentContainerStyle={styles.body} scrollEnabled={!isSigning}>
        <PhotoField
          title="Delivery photos"
          meta={`${draft.photos.length} of ${MAX_POD_PHOTOS} added`}
          photos={draft.photos}
          onChange={(photos) => update({ photos })}
          max={MAX_POD_PHOTOS}
          photoLabel={(photo, position) => `Photo ${position} · ${formatTime(photo.capturedAt)}`}
          addLabel="Add photo"
          prompt={{ title: 'Add a delivery photo', message: 'Cargo at the store, or the signed delivery note.' }}
        />

        <FormSection title="Received by">
          <TextField
            label="Received by"
            hideLabel
            value={draft.recipientName}
            onChangeText={(recipientName) => update({ recipientName })}
            onBlur={() => setNameTouched(true)}
            placeholder="Name · role, e.g. Pradeep Kumara · Store keeper"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={RECIPIENT_NAME_MAX_LENGTH}
            returnKeyType="done"
            error={nameError}
          />
        </FormSection>

        <CargoConditionPicker
          value={draft.cargoCondition}
          onChange={(cargoCondition) => update({ cargoCondition })}
          cargoSummary={`${trip.cargo.description} · ${formatWeight(trip.cargo.weightTonnes)}`}
        />

        <FormSection
          title="Receiver signature"
          action={
            draft.signature
              ? { label: 'Clear', accessibilityLabel: 'Clear signature', onPress: () => update({ signature: null }) }
              : undefined
          }>
          <SignaturePad
            value={draft.signature}
            onChange={(signature) => update({ signature })}
            signerName={draft.recipientName}
            onDrawingChange={setIsSigning}
          />
        </FormSection>

        <FormSection title="Notes" meta="Optional">
          <TextField
            label="Notes"
            hideLabel
            multiline
            value={draft.notes}
            onChangeText={(notes) => update({ notes })}
            placeholder="Anything the coordinator should know about this delivery"
            maxLength={POD_NOTES_MAX_LENGTH}
          />
        </FormSection>

        {submitState.kind === 'error' ? (
          <InfoBanner
            tone="danger"
            title="Couldn’t send the proof of delivery"
            message={`${submitState.message} Nothing you entered was lost.`}
          />
        ) : null}
      </KeyboardAwareScroll>

      <ActionBar
        label={submitState.kind === 'error' ? 'Try again' : 'Continue'}
        onPress={handleContinue}
        disabled={!canContinue}
        loading={isSubmitting}
        hint={
          canContinue
            ? 'Sends the proof of delivery. Next, enter the ending odometer to complete the trip.'
            : 'Enter who received the cargo to continue.'
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.xxl + spacing.xxs,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
});
