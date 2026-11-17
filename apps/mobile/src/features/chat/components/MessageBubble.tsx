import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatTime } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import type { Message } from '../types';

type MessageBubbleProps = {
  message: Message;
  mine: boolean;
  onRetry: () => void;
};

/** "10:19 · Seen", "Sending…", "Not sent · Tap to retry". */
function footer(message: Message, mine: boolean) {
  const time = formatTime(message.sentAt);
  if (!mine) return time;
  switch (message.status) {
    case 'sending':
      return 'Sending…';
    case 'failed':
      return 'Not sent · Tap to retry';
    case 'seen':
      return `${time} · Seen`;
    default:
      return time;
  }
}

/** Chat bubble: mine on the right in accent, theirs on the left in white (Driver — Chat). */
export function MessageBubble({ message, mine, onRetry }: MessageBubbleProps) {
  const failed = mine && message.status === 'failed';

  return (
    <Pressable
      disabled={!failed}
      onPress={onRetry}
      accessibilityRole={failed ? 'button' : undefined}
      accessibilityHint={failed ? 'Sends the message again' : undefined}
      style={[styles.row, mine ? styles.mineRow : styles.theirRow]}>
      <View style={[styles.bubble, mine ? styles.mine : styles.their, message.status === 'sending' && styles.sending]}>
        <Text style={[typography.message, mine && styles.mineText]}>{message.text}</Text>
      </View>
      <Text style={[typography.micro, styles.footer, failed && styles.failed]}>{footer(message, mine)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 3,
  },
  mineRow: {
    alignItems: 'flex-end',
  },
  theirRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderTopLeftRadius: radii.card,
    borderTopRightRadius: radii.card,
  },
  mine: {
    backgroundColor: colors.accent,
    borderBottomLeftRadius: radii.card,
    borderBottomRightRadius: radii.bubbleTail,
  },
  their: {
    backgroundColor: colors.surface,
    borderWidth: sizes.hairline,
    borderColor: colors.border,
    borderBottomLeftRadius: radii.bubbleTail,
    borderBottomRightRadius: radii.card,
  },
  sending: {
    opacity: 0.6,
  },
  mineText: {
    color: colors.surface,
  },
  footer: {
    color: colors.faint,
  },
  failed: {
    color: colors.danger,
  },
});
