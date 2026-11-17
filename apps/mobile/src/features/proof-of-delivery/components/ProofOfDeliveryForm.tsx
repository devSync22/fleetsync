import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActionBar, KeyboardAwareScroll, ScreenHeader, TextField } from '@/components/ui';
import { completeTripHref, type Trip } from '@/features/trips';
import { formatWeight } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { POD_NOTES_MAX_LENGTH, RECIPIENT_NAME_MAX_LENGTH } from '../constants';
import { usePodDraft } from '../hooks/usePodDraft';
import { podTripSubtitle } from '../tripSubtitle';
import { isPodDetailsValid, validateRecipientName } from '../validation';
import { CargoConditionPicker } from './CargoConditionPicker';
import { DeliveryPhotos } from './DeliveryPhotos';
import { FormSection } from './FormSection';
import { SignaturePad } from './SignaturePad';

/** Driver — Proof of delivery (Figma 298:7417) for an In-progress trip. */
export function ProofOfDeliveryForm({ trip }: { trip: Trip }) {
  // "Received by" starts with the trip's receiver ("Pradeep Kumara"); the driver can change it.
  const { draft, update } = usePodDraft(trip.id, trip.destination.contactName);
  const [nameTouched, setNameTouched] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const nameError = nameTouched ? validateRecipientName(draft.recipientName) : undefined;
  const canContinue = isPodDetailsValid(draft);

  function handleContinue() {
    // Save the draft as it is (even untouched) so Complete trip can read it.
    update({});
    router.push(completeTripHref(trip.id));
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Proof of delivery" subtitle={podTripSubtitle(trip)} />
      <KeyboardAwareScroll contentContainerStyle={styles.body} scrollEnabled={!isSigning}>
        <DeliveryPhotos photos={draft.photos} onChange={(photos) => update({ photos })} />

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
            invalid={Boolean(nameError)}
            helperText={nameError}
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
      </KeyboardAwareScroll>

      <ActionBar
        label="Continue"
        onPress={handleContinue}
        disabled={!canContinue}
        hint={
          canContinue
            ? 'Next, enter the ending odometer to complete the trip.'
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
