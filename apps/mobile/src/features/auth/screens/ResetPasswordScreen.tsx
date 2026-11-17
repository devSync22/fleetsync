import { router, useLocalSearchParams } from 'expo-router';
import { Info, LockKeyhole } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, InfoBanner, KeyboardAwareScroll, PasswordRules, PasswordStrengthMeter, TextField } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { AuthIcon } from '../components/AuthIcon';
import { BackLink } from '../components/BackLink';
import { useResetPassword } from '../hooks/useResetPassword';

/**
 * Set a new password — opened by the emailed link `fleetsync://reset-password?token=…&email=…`.
 * No mobile frame; content from web "Auth — Set new password", layout from "Mobile — Sign in".
 */
export function ResetPasswordScreen() {
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();
  const form = useResetPassword(token);

  function sendNewLink() {
    router.replace({ pathname: '/forgot-password', params: email ? { email } : {} });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <BackLink />
        <AuthIcon icon={LockKeyhole} />

        <View style={styles.titles}>
          <Text style={typography.hero} accessibilityRole="header">
            Set a new password
          </Text>
          {email ? <Text style={[typography.body, styles.muted]}>For {email}</Text> : null}
        </View>

        {form.linkExpired ? (
          <>
            <InfoBanner
              tone="danger"
              title="This link has expired"
              message="Reset links work for 30 minutes and only once. Ask for a new link to set your password."
            />
            <Button label="Send a new link" onPress={sendNewLink} />
          </>
        ) : (
          <>
            <View style={styles.passwordGroup}>
              <TextField
                label="New password"
                value={form.values.password}
                onChangeText={(text) => form.setField('password', text)}
                invalid={Boolean(form.errors.password)}
                helperText={form.errors.password}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              <PasswordStrengthMeter strength={form.strength} />
              <PasswordRules checks={form.passwordChecks} />
            </View>

            <TextField
              label="Confirm new password"
              value={form.values.confirmPassword}
              onChangeText={(text) => form.setField('confirmPassword', text)}
              invalid={Boolean(form.errors.confirmPassword)}
              helperText={form.errors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={form.submit}
            />

            {form.submitError ? (
              <InfoBanner tone="danger" title="Couldn’t update your password" message={form.submitError} />
            ) : null}

            <Button label="Update password" onPress={form.submit} loading={form.submitting} />

            <View style={styles.note}>
              <Info size={sizes.iconXs} color={colors.faint} />
              <Text style={[typography.caption, styles.faint]}>
                You’ll be signed out of other devices after the change.
              </Text>
            </View>
          </>
        )}
      </KeyboardAwareScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    paddingHorizontal: spacing.huge,
    paddingTop: spacing.giant + spacing.md,
    paddingBottom: spacing.huge,
    gap: spacing.xxxl,
  },
  titles: {
    gap: spacing.sm,
  },
  muted: {
    color: colors.muted,
  },
  faint: {
    flexShrink: 1,
    color: colors.faint,
  },
  passwordGroup: {
    gap: spacing.lg,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
});
