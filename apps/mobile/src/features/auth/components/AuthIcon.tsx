import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, sizes } from '@/theme';

const CIRCLE_SIZE = sizes.touchTarget;

/** 44 px accent-soft circle with an accent icon (key, lock) above the password screen titles. */
export function AuthIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <View style={styles.circle}>
      <Icon size={20} color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
