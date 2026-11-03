import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

import { formatFileSize } from '@/lib/format';

import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES } from '../constants';
import type { AccountDocument } from '../types';

type PickedFile = {
  name: string;
  uri: string;
  mimeType?: string | null;
  size?: number | null;
};

type PickResult = {
  accepted: AccountDocument[];
  /** Why files were refused, e.g. "photo.png isn't a PDF or JPG". */
  rejected: string[];
};

function mimeTypeOf(file: PickedFile): string | undefined {
  if (file.mimeType) return file.mimeType === 'image/jpg' ? 'image/jpeg' : file.mimeType;
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'application/pdf';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  return undefined;
}

function checkFiles(files: PickedFile[]): PickResult {
  const result: PickResult = { accepted: [], rejected: [] };
  files.forEach((file, index) => {
    const mimeType = mimeTypeOf(file);
    const size = file.size ?? 0;
    if (!mimeType || !(DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType)) {
      result.rejected.push(`${file.name} isn’t a PDF or JPG`);
    } else if (size > MAX_DOCUMENT_BYTES) {
      result.rejected.push(`${file.name} is ${formatFileSize(size)}, over the 5 MB limit`);
    } else {
      result.accepted.push({
        id: `${Date.now()}-${index}`,
        name: file.name,
        uri: file.uri,
        mimeType,
        sizeBytes: size,
      });
    }
  });
  return result;
}

const EMPTY: PickResult = { accepted: [], rejected: [] };

async function chooseFiles(): Promise<PickResult> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...DOCUMENT_MIME_TYPES],
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return EMPTY;
  return checkFiles(result.assets);
}

async function takePhoto(): Promise<PickResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Camera access needed', 'Allow camera access in Settings to take a photo of your documents.');
    return EMPTY;
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
  if (result.canceled) return EMPTY;
  return checkFiles(
    result.assets.map((asset, index) => ({
      name: asset.fileName ?? `Photo-${Date.now()}-${index + 1}.jpg`,
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      size: asset.fileSize,
    })),
  );
}

/** "Add file or take photo": asks which, then returns the files that pass the PDF/JPG and 5 MB rules. */
export function useDocumentPicker(onPicked: (result: PickResult) => void) {
  function run(pick: () => Promise<PickResult>) {
    pick()
      .then(onPicked)
      .catch(() => onPicked({ accepted: [], rejected: ['Couldn’t add the file. Please try again.'] }));
  }

  function addDocument() {
    Alert.alert('Add a document', 'NIC copy or driving licence · PDF or JPG · up to 5 MB', [
      { text: 'Take photo', onPress: () => run(takePhoto) },
      { text: 'Choose file', onPress: () => run(chooseFiles) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return { addDocument };
}
