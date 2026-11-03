import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, InfoBanner, TextField } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

/**
 * Placeholder until branch mobile-auth builds "Mobile — Sign in (Driver & Mechanic)".
 * There is no real authentication yet: the two buttons just open each role's tabs.
 */
export default function SignInRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.titles}>
            <Text style={typography.screenTitle}>Sign in</Text>
            <Text style={typography.caption}>FleetSync for drivers and mechanics</Text>
          </View>

          <InfoBanner
            tone="info"
            title="Placeholder screen"
            message="Sign-in is built in the mobile-auth branch. Pick a role below to preview its tabs."
          />

          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. kasun@fleetsync.lk"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoComplete="password"
          />

          <View style={styles.actions}>
            <Button label="Continue as driver" onPress={() => router.replace('/driver/home')} />
            <Button
              label="Continue as mechanic"
              variant="secondary"
              onPress={() => router.replace('/mechanic/queue')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  body: {
    padding: spacing.xxl,
    gap: spacing.xxl,
  },
  titles: {
    gap: spacing.xxs,
    paddingTop: spacing.huge,
  },
  actions: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
});
