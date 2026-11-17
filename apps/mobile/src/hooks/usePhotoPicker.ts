import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking } from 'react-native';

export type PhotoSource = 'camera' | 'library';

/** A photo taken or chosen on the phone (delivery photos, loading photos…). */
export type PickedPhoto = {
  id: string;
  /** Local file URI on the phone; the real API uploads this file. */
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  /** Null when the picker doesn't report the size. */
  fileSizeBytes: number | null;
  /** ISO date-time the photo was added. */
  capturedAt: string;
  source: PhotoSource;
};

type PermissionKind = 'camera' | 'photos';

/** Explains a denied permission; offers Settings when the system won't ask again. */
function showPermissionAlert(kind: PermissionKind, canAskAgain: boolean) {
  const title = kind === 'camera' ? 'Camera access needed' : 'Photo access needed';
  const message =
    kind === 'camera'
      ? 'Allow FleetSync to use the camera to take trip photos.'
      : 'Allow FleetSync to open your photos to add a trip photo.';
  if (canAskAgain) {
    Alert.alert(title, message);
    return;
  }
  Alert.alert(title, `${message} You can turn this on in Settings.`, [
    { text: 'Not now', style: 'cancel' },
    { text: 'Open Settings', onPress: () => void Linking.openSettings() },
  ]);
}

function toPickedPhotos(assets: ImagePicker.ImagePickerAsset[], source: PhotoSource): PickedPhoto[] {
  const capturedAt = new Date().toISOString();
  return assets.map((asset, index) => ({
    id: `${Date.now()}-${index}`,
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSizeBytes: asset.fileSize ?? null,
    capturedAt,
    source,
  }));
}

async function takePhoto(): Promise<PickedPhoto[]> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    showPermissionAlert('camera', permission.canAskAgain);
    return [];
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  return result.canceled ? [] : toPickedPhotos(result.assets, 'camera');
}

async function chooseFromLibrary(limit: number): Promise<PickedPhoto[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    showPermissionAlert('photos', permission.canAskAgain);
    return [];
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
  });
  return result.canceled ? [] : toPickedPhotos(result.assets.slice(0, limit), 'library');
}

export type PhotoPrompt = {
  /** "Add a delivery photo". */
  title: string;
  /** "Cargo at the store, or the signed delivery note." */
  message: string;
};

/**
 * "Add photo": asks camera or gallery, handles denied permissions, and passes the new photos
 * (never more than `remaining`) to `onAdd`.
 */
export function usePhotoPicker(remaining: number, onAdd: (photos: PickedPhoto[]) => void, prompt: PhotoPrompt) {
  function run(pick: () => Promise<PickedPhoto[]>) {
    pick()
      .then((photos) => {
        if (photos.length > 0) onAdd(photos.slice(0, remaining));
      })
      .catch(() => Alert.alert('Couldn’t add the photo', 'Please try again.'));
  }

  function addPhoto() {
    if (remaining <= 0) return;
    Alert.alert(prompt.title, prompt.message, [
      { text: 'Take photo', onPress: () => run(takePhoto) },
      { text: 'Choose from gallery', onPress: () => run(() => chooseFromLibrary(remaining)) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return { addPhoto };
}
