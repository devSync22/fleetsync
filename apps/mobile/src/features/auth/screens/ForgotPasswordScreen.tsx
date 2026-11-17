import { useLocalSearchParams } from 'expo-router';
import { KeyRound } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, InfoBanner, TextField } from '@/components/ui';
import { colors, spacing, typography } from '@/theme';

import { AuthIcon } from '../components/AuthIcon';
import { BackLink } from '../components/BackLink';
import { KeyboardAwareScroll } from '../components/KeyboardAwareScroll';
import { formatCountdown } from '../hooks/useCountdown';
import { useForgotPassword } from '../hooks/useForgotPassword';

/**
 * Forgot password — no mobile frame; content from web "Auth — Forgot password",
 * layout from "Mobile — Sign in".
 */
export function ForgotPasswordScreen() {
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const form = useForgotPassword(emailParam ?? '');
  const canResend = form.sent && form.resendIn === 0 && !form.sending;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <BackLink />
        <AuthIcon icon={KeyRound} />

        <View style={styles.titles}>
          <Text style={typography.hero} accessibilityRole="header">
            Forgot your password?
          </Text>
          <Text style={[typography.body, styles.muted]}>
            Enter the email you sign in with. We’ll send a link to set a new password.
          </Text>
        </View>

        <TextField
          label="Email address"
          value={form.email}
          onChangeText={form.setEmail}
          invalid={Boolean(form.emailError)}
          helperText={form.emailError}
          placeholder="name@fleetms.lk"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="send"
          onSubmitEditing={form.send}
        />

        <Button
          label="Send reset link"
          onPress={form.send}
          loading={form.sending && !form.sent}
          disabled={form.resendIn > 0}
        />

        {form.sendError ? <InfoBanner tone="danger" title="Couldn’t send the link" message={form.sendError} /> : null}

        {form.sent ? (
          <>
            <InfoBanner
              tone="success"
              title="Check your email"
              message="If an account exists for that email, a reset link is on its way. It expires in 30 minutes."
            />
            <View style={styles.resend} accessibilityLiveRegion="polite">
              <Text style={[typography.bodySmall, styles.muted]}>Didn’t get it?</Text>
              {canResend ? (
                <Pressable accessibilityRole="button" onPress={form.send} hitSlop={spacing.lg}>
                  <Text style={typography.link}>Send again</Text>
                </Pressable>
              ) : (
                <Text
                  style={[typography.link, styles.disabled]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: true }}>
                  {form.sending ? 'Sending…' : `Send again in ${formatCountdown(form.resendIn)}`}
                </Text>
              )}
            </View>
          </>
        ) : null}
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
  resend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  disabled: {
    color: colors.faint,
  },
});
