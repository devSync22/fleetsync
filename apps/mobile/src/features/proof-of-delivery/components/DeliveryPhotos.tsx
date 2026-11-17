import { Alert, StyleSheet, View, useWindowDimensions } from 'react-native';

import { sizes, spacing } from '@/theme';

import { MAX_POD_PHOTOS } from '../constants';
import { usePhotoPicker } from '../hooks/usePhotoPicker';
import type { PodPhoto } from '../types';
import { AddPhotoTile } from './AddPhotoTile';
import { FormSection } from './FormSection';
import { PhotoTile } from './PhotoTile';

type DeliveryPhotosProps = {
  photos: PodPhoto[];
  onChange: (photos: PodPhoto[]) => void;
};

/** "Delivery photos · 2 of 3 added": photo tiles plus an Add photo tile until the limit is reached. */
export function DeliveryPhotos({ photos, onChange }: DeliveryPhotosProps) {
  const { width } = useWindowDimensions();
  // Three tiles per row: 112 px on a 390 px screen, smaller on narrow phones.
  const tileSize = Math.min(sizes.photoTile, Math.floor((width - 2 * spacing.xxl - 2 * spacing.ml) / MAX_POD_PHOTOS));
  const remaining = MAX_POD_PHOTOS - photos.length;
  const { addPhoto } = usePhotoPicker(remaining, (added) => onChange([...photos, ...added]));

  function confirmRemove(photo: PodPhoto, position: number) {
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
    <FormSection title="Delivery photos" meta={`${photos.length} of ${MAX_POD_PHOTOS} added`}>
      <View style={styles.row}>
        {photos.map((photo, index) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            position={index + 1}
            size={tileSize}
            onPress={() => confirmRemove(photo, index + 1)}
          />
        ))}
        {remaining > 0 ? <AddPhotoTile size={tileSize} onPress={addPhoto} /> : null}
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
