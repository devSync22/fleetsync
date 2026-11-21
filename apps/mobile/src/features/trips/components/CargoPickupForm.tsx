import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ActionBar,
  Chip,
  FormSection,
  InfoBanner,
  KeyboardAwareScroll,
  PhotoField,
  ScreenHeader,
  TextField,
} from '@/components/ui';
import type { PickedPhoto } from '@/hooks/usePhotoPicker';
import { formatTime, formatWeight } from '@/lib/format';
import { colors, spacing } from '@/theme';

import { useTripAction } from '../hooks/useTripAction';
import { confirmPickup } from '../services/tripsApi';
import type { PickupCargoCondition, Trip } from '../types';
import {
  HANDED_OVER_BY_MAX_LENGTH,
  MAX_LOADING_PHOTOS,
  SEAL_NUMBER_MAX_LENGTH,
  validateHandedOverBy,
  validateSealNumber,
} from '../validation';

type CargoPickupFormProps = {
  trip: Trip;
  /** Reload the trip (the coordinator cancelled it meanwhile). */
  onCancelled: () => void;
};

const CONDITIONS: readonly PickupCargoCondition[] = ['All loaded', 'Fewer than ordered', 'Damaged'];

/** Driver — Cargo picked up (Figma 400:8282): loading photos, who handed it over, what was loaded, seal number. */
export function CargoPickupForm({ trip, onCancelled }: CargoPickupFormProps) {
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  // Starts with the pickup contact ("Ruwini Fonseka"); the driver can change it.
  const [handedOverBy, setHandedOverBy] = useState(trip.pickup.contactName);
  const [condition, setCondition] = useState<PickupCargoCondition>('All loaded');
  const [sealNumber, setSealNumber] = useState('');
  const [touched, setTouched] = useState({ handedOverBy: false, sealNumber: false });

  const handedOverError = validateHandedOverBy(handedOverBy);
  const sealError = validateSealNumber(sealNumber);
  const canConfirm = !handedOverError && !sealError;

  const { state, run } = useTripAction(
    () =>
      confirmPickup(trip.id, {
        pickedUpAt: new Date().toISOString(),
        handedOverBy: handedOverBy.trim(),
        cargoCondition: condition,
        sealNumber: sealNumber.trim() || undefined,
        photos,
      }),
    // Back to Active trip, which reloads in its "heading to destination" state.
    () => router.back(),
    onCancelled,
  );

  const { cargo } = trip;
  const conditionLabel = (value: PickupCargoCondition) =>
    value === 'All loaded' ? `All ${cargo.packageCount} loaded` : value;

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Confirm cargo picked up" subtitle={`${trip.id} · ${trip.pickup.name}`} />
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <PhotoField
          title="Loading photos (optional)"
          meta={`${photos.length} added`}
          photos={photos}
          onChange={setPhotos}
          max={MAX_LOADING_PHOTOS}
          photoLabel={(photo) => `Loaded · ${formatTime(photo.capturedAt)}`}
          addLabel="Take photo"
          prompt={{ title: 'Add a loading photo', message: 'The loaded cargo, or the signed loading note.' }}
        />

        <FormSection title="Handed over by">
          <TextField
            label="Handed over by"
            hideLabel
            value={handedOverBy}
            onChangeText={setHandedOverBy}
            onBlur={() => setTouched((current) => ({ ...current, handedOverBy: true }))}
            placeholder="Name · role, e.g. Ruwini Fonseka · Warehouse"
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={HANDED_OVER_BY_MAX_LENGTH}
            returnKeyType="done"
            invalid={touched.handedOverBy && Boolean(handedOverError)}
            helperText={touched.handedOverBy ? handedOverError : undefined}
          />
        </FormSection>

        <FormSection title="Cargo loaded" meta={`${cargo.packageCount} ${cargo.packageLabel} · ${formatWeight(cargo.weightTonnes)}`}>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Cargo loaded">
            {CONDITIONS.map((value) => (
              <Chip
                key={value}
                variant="choice"
                label={conditionLabel(value)}
                selected={value === condition}
                onPress={() => setCondition(value)}
              />
            ))}
          </View>
        </FormSection>

        <FormSection title="Seal number (optional)">
          <TextField
            label="Seal number"
            hideLabel
            mono
            value={sealNumber}
            onChangeText={setSealNumber}
            onBlur={() => setTouched((current) => ({ ...current, sealNumber: true }))}
            placeholder="e.g. 22871"
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={SEAL_NUMBER_MAX_LENGTH}
            returnKeyType="done"
            invalid={touched.sealNumber && Boolean(sealError)}
            helperText={touched.sealNumber ? sealError : undefined}
          />
        </FormSection>

        {state.kind === 'error' ? (
          <InfoBanner tone="danger" title="Couldn’t confirm the pickup" message={`${state.message} Nothing you entered was lost.`} />
        ) : null}
      </KeyboardAwareScroll>

      <ActionBar
        label={state.kind === 'error' ? 'Try again' : 'Confirm pickup'}
        onPress={run}
        disabled={!canConfirm}
        loading={state.kind === 'submitting'}
        hint={
          canConfirm
            ? 'The trip shows “Cargo picked up” for the coordinator and customer.'
            : 'Enter who handed over the cargo to continue.'
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
