import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { formatTime } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { PodSignature } from '../types';

type SignaturePadProps = {
  value: PodSignature | null;
  onChange: (signature: PodSignature | null) => void;
  /** Shown under the line once signed — "Signed 11:16 · Pradeep Kumara". */
  signerName: string;
  /** True while a finger is down, so the parent can stop scrolling. */
  onDrawingChange?: (drawing: boolean) => void;
};

type PadSize = { width: number; height: number };

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Receiver signature (Driver — Proof of delivery). Built on the React Native touch responder and
 * react-native-svg, so it needs no extra package and works in Expo Go. Strokes are kept as SVG paths.
 */
export function SignaturePad({ value, onChange, signerName, onDrawingChange }: SignaturePadProps) {
  const [size, setSize] = useState<PadSize>({ width: 0, height: 0 });
  const [livePath, setLivePath] = useState<string | null>(null);
  // The stroke being drawn; only read and written inside touch handlers.
  const currentPath = useRef('');

  function point(event: GestureResponderEvent) {
    const x = Math.min(Math.max(event.nativeEvent.locationX, 0), size.width);
    const y = Math.min(Math.max(event.nativeEvent.locationY, 0), size.height);
    return `${round(x)} ${round(y)}`;
  }

  function startStroke(event: GestureResponderEvent) {
    onDrawingChange?.(true);
    currentPath.current = `M${point(event)}`;
    setLivePath(currentPath.current);
  }

  function extendStroke(event: GestureResponderEvent) {
    currentPath.current += ` L${point(event)}`;
    setLivePath(currentPath.current);
  }

  function finishStroke() {
    // A tap with no movement still leaves a dot.
    const path = currentPath.current.includes('L') ? currentPath.current : `${currentPath.current} l0.5 0.5`;
    currentPath.current = '';
    setLivePath(null);
    onDrawingChange?.(false);
    onChange({
      paths: [...(value?.paths ?? []), path],
      padWidth: size.width,
      padHeight: size.height,
      signedAt: new Date().toISOString(),
    });
  }

  function handleLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  }

  const caption = value
    ? `Signed ${formatTime(value.signedAt)} · ${signerName.trim() || 'Receiver'}`
    : 'Ask the receiver to sign above the line';
  const strokes = livePath ? [...(value?.paths ?? []), livePath] : (value?.paths ?? []);

  return (
    <View
      style={styles.pad}
      onLayout={handleLayout}
      accessible
      accessibilityLabel={value ? 'Receiver signature, signed' : 'Receiver signature pad, empty. Ask the receiver to sign here.'}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      // Keep the gesture: don't let the surrounding ScrollView take it over mid-signature.
      onResponderTerminationRequest={() => false}
      onResponderGrant={startStroke}
      onResponderMove={extendStroke}
      onResponderRelease={finishStroke}
      onResponderTerminate={finishStroke}>
      {/* Children don't take touches, so locationX/Y are always relative to the pad. */}
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill}>
        {strokes.map((d, index) => (
          <Path
            key={index}
            d={d}
            stroke={colors.text}
            strokeWidth={sizes.signatureStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ))}
      </Svg>
      <View pointerEvents="none" style={styles.baseline} />
      <Text pointerEvents="none" style={[typography.micro, styles.caption]} numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    height: sizes.signaturePad,
    overflow: 'hidden',
    borderRadius: radii.tile,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  // Signing line under the drawing area, as in the frame (the signature is drawn above it).
  baseline: {
    position: 'absolute',
    left: spacing.xxxl,
    right: spacing.xxxl,
    bottom: spacing.giant,
    height: sizes.hairline,
    backgroundColor: colors.border,
  },
  caption: {
    position: 'absolute',
    left: spacing.xxxl,
    right: spacing.xxxl,
    bottom: spacing.lg,
    color: colors.faint,
  },
});
