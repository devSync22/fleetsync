import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatFileSize } from '@/lib/format';
import { colors, fonts, fontSizes, radii, sizes, spacing, toneColors, typography } from '@/theme';

import type { AccountDocument } from '../types';

type DocumentRowProps = {
  document: AccountDocument;
  onRemove: () => void;
};

/** An attached file: PDF/JPG tile, name, "1.1 MB · uploaded", remove button. */
export function DocumentRow({ document, onRemove }: DocumentRowProps) {
  const isPdf = document.mimeType === 'application/pdf';
  const tone = isPdf ? toneColors.danger : toneColors.info;

  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: tone.soft }]}>
        <Text style={[styles.tileLabel, { color: tone.strong }]}>{isPdf ? 'PDF' : 'JPG'}</Text>
      </View>
      <View style={styles.text}>
        <Text style={[typography.label, styles.name]} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={[typography.micro, styles.status]}>{formatFileSize(document.sizeBytes)} · uploaded</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${document.name}`}
        onPress={onRemove}
        hitSlop={spacing.lg}
        style={styles.remove}>
        <X size={sizes.iconSm} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.ml,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.ml,
    borderRadius: radii.tile,
    backgroundColor: colors.background,
  },
  tile: {
    width: 32,
    height: 32,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.tag,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  name: {
    lineHeight: undefined,
  },
  status: {
    color: colors.success,
  },
  remove: {
    padding: spacing.xs,
  },
});
