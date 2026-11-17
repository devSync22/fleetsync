import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/theme';

import { MESSAGE_MAX_LENGTH, validateMessage } from '../validation';

type ComposerProps = {
  /** "Message Ishara…". */
  placeholder: string;
  /** Returns false when the text was not accepted (it is then kept in the field). */
  onSend: (text: string) => boolean;
};

/** Message field and round Send button at the bottom of a thread. */
export function Composer({ placeholder, onSend }: ComposerProps) {
  const [text, setText] = useState('');
  const canSend = validateMessage(text) === null;

  function send() {
    if (canSend && onSend(text)) setText('');
  }

  return (
    <View style={styles.bar}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.faint}
        accessibilityLabel={placeholder}
        maxLength={MESSAGE_MAX_LENGTH}
        multiline
        style={[typography.body, styles.input]}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send"
        accessibilityState={{ disabled: !canSend }}
        disabled={!canSend}
        onPress={send}
        hitSlop={(sizes.touchTarget - sizes.sendButton) / 2}
        style={({ pressed }) => [styles.send, !canSend && styles.sendDisabled, pressed && styles.pressed]}>
        <Send size={sizes.iconSm} color={colors.surface} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.ml,
    backgroundColor: colors.surface,
    borderTopWidth: sizes.hairline,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: sizes.sendButton,
    maxHeight: sizes.composerMaxHeight,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.ml,
    paddingBottom: spacing.ml,
    borderRadius: sizes.sendButton / 2,
    backgroundColor: colors.background,
    // Line height on a TextInput clips text on Android; padding sets the height instead.
    lineHeight: undefined,
  },
  send: {
    width: sizes.sendButton,
    height: sizes.sendButton,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: colors.faint,
  },
  pressed: {
    opacity: 0.8,
  },
});
