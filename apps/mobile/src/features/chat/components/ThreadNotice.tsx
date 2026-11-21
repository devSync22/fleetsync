import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/theme';

/** Centred trip event in a thread — "Issue reported 10:15 · Tyres · can continue carefully". */
export function ThreadNotice({ text }: { text: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.notice}>
        <Text style={typography.notice}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  notice: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radii.tile,
    backgroundColor: colors.pendingSoft,
  },
});
