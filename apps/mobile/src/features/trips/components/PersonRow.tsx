import { router } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, IconButton } from '@/components/ui';
import { canMessage, chatRoomHref, type ChatRole } from '@/features/chat';
import { sizes, spacing, typography } from '@/theme';

import type { TripPerson } from '../types';

/** A person on the trip, with a button to message them when the chat permissions allow it (never the customer). */
export function PersonRow({ person, orderId }: { person: TripPerson; orderId: string }) {
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
      {canMessage('driver', person.role.toLowerCase() as ChatRole) ? (
        <IconButton
          icon={MessageSquare}
          accessibilityLabel={`Message ${person.name}`}
          onPress={() => router.navigate(chatRoomHref('driver', orderId, person.id))}
        />
      ) : null}
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
