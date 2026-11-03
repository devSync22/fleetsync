import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, logoColors, sizes, spacing, typography } from '@/theme';

const LOGO_SIZE = sizes.touchTarget;

/** Logo tile + "FleetSync" wordmark + "For drivers and mechanics" (Mobile — Sign in). */
export function BrandHeader() {
  return (
    <View style={styles.row} accessible accessibilityLabel="FleetSync, for drivers and mechanics">
      <Image source={require('@/assets/images/logo-icon.svg')} style={styles.logo} contentFit="contain" />
      <View style={styles.text}>
        <Text style={[typography.cardTitle, styles.wordmark]}>
          Fleet<Text style={styles.sync}>Sync</Text>
        </Text>
        <Text style={typography.caption}>For drivers and mechanics</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  text: {
    gap: 1,
  },
  wordmark: {
    fontFamily: fonts.bold,
    lineHeight: undefined,
  },
  sync: {
    color: logoColors.sync,
  },
});
