import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, IconButton } from '@/components/ui';
import { sizes, spacing, typography } from '@/theme';

import type { TripPerson } from '../types';

/** A person in the order's chat room, with a button to message them. */
export function PersonRow({ person }: { person: TripPerson }) {
  const subtitle = person.detail ? `${person.role} · ${person.detail}` : person.role;

  return (
    <View style={styles.row}>
      <Avatar name={person.name} size={sizes.iconButton} tone="neutral" />
      <View style={styles.text}>
        <Text style={typography.bodyMedium} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={typography.caption} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <IconButton
        icon={MessageSquare}
        accessibilityLabel={`Message ${person.name}`}
        // The per-person chat thread is built in the chat branch (feature 8); open the Chat tab for now.
        onPress={() => router.navigate('/driver/chat')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  text: {
    flex: 1,
    gap: 1,
  },
});
