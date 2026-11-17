import { useEffect, useState } from 'react';
import { Animated, StyleSheet, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radii } from '@/theme';

type SkeletonProps = {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Grey placeholder block that gently pulses while content loads. Compose several to sketch a screen. */
export function Skeleton({ width = '100%', height, radius = radii.control, style }: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.greySoft,
  },
});
