import { Alert, StyleSheet, View, useWindowDimensions } from 'react-native';

import { usePhotoPicker, type PhotoPrompt, type PickedPhoto } from '@/hooks/usePhotoPicker';
import { sizes, spacing } from '@/theme';

import { AddPhotoTile } from './AddPhotoTile';
import { FormSection } from './FormSection';
import { PhotoTile } from './PhotoTile';

type PhotoFieldProps = {
  /** "Delivery photos", "Loading photos (optional)". */
  title: string;
  /** Right-hand count — "2 of 3 added", "1 added". */
  meta: string;
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
  max: number;
  /** Label on each tile — "Photo 1 · 11:14", "Loaded · 09:54". */
  photoLabel: (photo: PickedPhoto, position: number) => string;
  /** Text on the dashed tile — "Add photo", "Take photo". */
  addLabel: string;
  prompt: PhotoPrompt;
};

/** Photo tiles plus a dashed add tile until `max` is reached (Proof of delivery, Cargo picked up). */
export function PhotoField({ title, meta, photos, onChange, max, photoLabel, addLabel, prompt }: PhotoFieldProps) {
  const { width } = useWindowDimensions();
  // Three tiles per row: 112 px on a 390 px screen, smaller on narrow phones.
  const tileSize = Math.min(sizes.photoTile, Math.floor((width - 2 * spacing.xxl - 2 * spacing.ml) / 3));
  const remaining = max - photos.length;
  const { addPhoto } = usePhotoPicker(remaining, (added) => onChange([...photos, ...added]), prompt);

  function confirmRemove(photo: PickedPhoto, position: number) {
    Alert.alert(`Remove photo ${position}?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onChange(photos.filter((candidate) => candidate.id !== photo.id)),
      },
    ]);
  }

  return (
    <FormSection title={title} meta={meta}>
      <View style={styles.row}>
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            uri={photo.uri}
            label={photoLabel(photo, index + 1)}
            size={tileSize}
            onPress={() => confirmRemove(photo, index + 1)}
          />
        ))}
        {remaining > 0 ? <AddPhotoTile label={addLabel} size={tileSize} onPress={addPhoto} /> : null}
      </View>
    </FormSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.ml,
  },
});
