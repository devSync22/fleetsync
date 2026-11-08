import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type KeyboardAwareScrollProps = {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Turn scrolling off while a child needs the drag gesture (e.g. a signature pad). */
  scrollEnabled?: boolean;
};

/**
 * Scrollable form body that stays above the keyboard (Expo keyboard-handling guide:
 * `padding` on iOS; on Android the view itself prevents covering the input).
 */
export function KeyboardAwareScroll({ children, contentContainerStyle, scrollEnabled = true }: KeyboardAwareScrollProps) {
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentContainerStyle]}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
