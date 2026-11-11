import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts, Radius } from '@/constants/theme'

import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE } from '../constants'
import type { PickedDocument } from '../types'
import { formatFileSize } from '../utils/format'

type DocumentListProps = {
  documents: PickedDocument[]
  onChange: (documents: PickedDocument[]) => void
  /** Error from the parent form, e.g. "Add at least one document". */
  error?: string
}

/** PDF documents get a red "PDF" badge, everything else (photos) a blue "JPG" badge. */
function isPdf(document: PickedDocument) {
  return document.mimeType === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf')
}

/**
 * Picked documents + "Add file or take photo" (Figma node 195:6875).
 * Files are only attached locally here; they're uploaded with the request.
 */
export function DocumentList({ documents, onChange, error }: DocumentListProps) {
  // Message for files rejected in the last add (too large).
  const [rejection, setRejection] = useState<string>()

  /** Adds new documents, skipping ones over the size limit and exact duplicates. */
  function addDocuments(incoming: PickedDocument[]) {
    const tooLarge = incoming.filter((doc) => doc.size !== undefined && doc.size > MAX_DOCUMENT_SIZE)
    const accepted = incoming.filter(
      (doc) =>
        !tooLarge.includes(doc) &&
        !documents.some((existing) => existing.name === doc.name && existing.size === doc.size),
    )

    setRejection(
      tooLarge.length > 0
        ? `${tooLarge.map((doc) => doc.name).join(', ')}: larger than ${formatFileSize(MAX_DOCUMENT_SIZE)}`
        : undefined,
    )
    if (accepted.length > 0) onChange([...documents, ...accepted])
  }

  async function pickFiles() {
    const result = await DocumentPicker.getDocumentAsync({
      type: DOCUMENT_MIME_TYPES,
      multiple: true,
      // Copies files into the app cache so they can be read later for the upload.
      copyToCacheDirectory: true,
    })
    if (result.canceled) return
    addDocuments(
      result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType,
      })),
    )
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      Alert.alert(
        'Camera access needed',
        'Allow camera access in Settings to photograph your documents, or choose a file instead.',
      )
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      // Smaller photos upload faster and stay under the 5 MB limit; still readable.
      quality: 0.7,
    })
    if (result.canceled) return
    const photo = result.assets[0]
    addDocuments([
      {
        uri: photo.uri,
        name: photo.fileName ?? `photo-${Date.now()}.jpg`,
        size: photo.fileSize,
        mimeType: photo.mimeType ?? 'image/jpeg',
      },
    ])
  }

  function handleAdd() {
    // Web has no camera flow here and no native Alert buttons, so just open the file picker.
    if (Platform.OS === 'web') {
      void pickFiles()
      return
    }
    Alert.alert('Add a document', 'NIC copy or driving licence', [
      { text: 'Choose file', onPress: () => void pickFiles() },
      { text: 'Take photo', onPress: () => void takePhoto() },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  function removeDocument(index: number) {
    onChange(documents.filter((_, i) => i !== index))
  }

  const message = error ?? rejection

  return (
    <View style={styles.list}>
      {documents.map((document, index) => {
        const pdf = isPdf(document)
        return (
          <View key={`${document.uri}-${index}`} style={styles.row}>
            {/* File type badge: red for PDF, blue for photos. */}
            <View style={[styles.badge, pdf ? styles.badgePdf : styles.badgeImage]}>
              <Text style={[styles.badgeText, pdf ? styles.badgeTextPdf : styles.badgeTextImage]}>
                {pdf ? 'PDF' : 'JPG'}
              </Text>
            </View>
            <View style={styles.fileText}>
              <Text style={styles.fileName} numberOfLines={1}>
                {document.name}
              </Text>
              {/* "added", not "uploaded": the file is only sent when the request is submitted. */}
              <Text style={styles.fileMeta}>
                {document.size !== undefined ? `${formatFileSize(document.size)} · ` : ''}added
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove ${document.name}`}
              onPress={() => removeDocument(index)}
              hitSlop={14}
            >
              <Icon source={require('@/assets/icons/x.svg')} size={16} />
            </Pressable>
          </View>
        )
      })}

      <Pressable
        accessibilityRole="button"
        onPress={handleAdd}
        style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
      >
        <Icon source={require('@/assets/icons/upload.svg')} size={16} />
        <Text style={styles.addLabel}>Add file or take photo</Text>
      </Pressable>

      {message && <Text style={styles.error}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 6,
  },
  badgePdf: {
    backgroundColor: Colors.dangerSoft,
  },
  badgeImage: {
    backgroundColor: Colors.infoSoft,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 9,
  },
  badgeTextPdf: {
    color: Colors.danger,
  },
  badgeTextImage: {
    color: Colors.info,
  },
  fileText: {
    flex: 1,
    gap: 1,
  },
  fileName: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.textDefault,
  },
  fileMeta: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.success,
  },
  // Dashed 1.5px "add" button.
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.line,
    borderRadius: Radius.lg,
  },
  addButtonPressed: {
    backgroundColor: Colors.background,
  },
  addLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: Colors.accent,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.danger,
  },
})
