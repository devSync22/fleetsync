import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, sizes, spacing, typography } from '@/theme';

/** "‹ Back to sign in" text link at the top of the password screens. */
export function BackLink() {
  function backToSignIn() {
    router.dismissTo('/sign-in');
  }

  return (
    <Pressable accessibilityRole="link" onPress={backToSignIn} hitSlop={spacing.lg} style={styles.link}>
      <ChevronLeft size={sizes.iconXs} color={colors.accent} />
      <Text style={typography.link}>Back to sign in</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
  },
});
