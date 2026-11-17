import { Send } from 'lucide-react-native';
import { useState, type ComponentRef, type RefObject } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card } from '@/components/ui';
import { formatTime } from '@/lib/format';
import { colors, radii, sizes, spacing, typography } from '@/theme';

import { useTripAction } from '../hooks/useTripAction';
import { addTripNote } from '../services/tripsApi';
import type { Trip } from '../types';
import { TRIP_NOTE_MAX_LENGTH, validateTripNote } from '../validation';

type TripNotesCardProps = {
  trip: Trip;
  /** Focused by the "Add note" tile. */
  inputRef: RefObject<ComponentRef<typeof TextInput> | null>;
  /** False once the trip is cancelled: notes stay visible, the input goes away. */
  canAdd: boolean;
  /** Reload the trip after a note is saved, or when the coordinator cancelled it. */
  onChanged: () => void;
};

/** TRIP NOTES (seen by the coordinator), newest first, with "Add a note for this trip…". */
export function TripNotesCard({ trip, inputRef, canAdd, onChanged }: TripNotesCardProps) {
  const [text, setText] = useState('');
  const { state, run } = useTripAction(
    () => addTripNote(trip.id, text),
    () => {
      setText('');
      onChanged();
    },
    onChanged,
  );
  const isSending = state.kind === 'submitting';
  const canSend = validateTripNote(text) === undefined && !isSending;
  const notes = [...trip.notes].reverse();

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={[typography.sectionLabel, styles.title]} accessibilityRole="header">
          Trip notes
        </Text>
        <Text style={[typography.micro, styles.seenBy]}>Seen by the coordinator</Text>
      </View>

      {notes.length === 0 ? <Text style={typography.caption}>No notes yet.</Text> : null}
      {notes.map((note) => (
        <View key={note.id} style={styles.note}>
          <Text style={typography.monoCaption}>{formatTime(note.createdAt)}</Text>
          <Text style={[typography.bodySmall, styles.noteText]}>{note.text}</Text>
        </View>
      ))}

      {canAdd ? (
        <>
          <View style={styles.input}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={setText}
              placeholder="Add a note for this trip…"
              placeholderTextColor={colors.faint}
              accessibilityLabel="Add a note for this trip"
              maxLength={TRIP_NOTE_MAX_LENGTH}
              multiline
              editable={!isSending}
              style={[typography.bodySmall, styles.inputText]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send note"
              accessibilityState={{ disabled: !canSend }}
              disabled={!canSend}
              onPress={run}
              hitSlop={spacing.lg}>
              {isSending ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Send size={sizes.iconSm} color={canSend ? colors.accent : colors.faint} />
              )}
            </Pressable>
          </View>
          {state.kind === 'error' ? (
            <Text style={[typography.caption, styles.error]} accessibilityRole="alert">
              Couldn’t save the note. {state.message}
            </Text>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
  },
  seenBy: {
    color: colors.faint,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.ml,
  },
  noteText: {
    flex: 1,
    lineHeight: 19,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.tile,
    borderWidth: sizes.hairline,
    borderColor: colors.line,
  },
  inputText: {
    flex: 1,
    paddingVertical: spacing.ml,
  },
  error: {
    color: colors.danger,
  },
});
