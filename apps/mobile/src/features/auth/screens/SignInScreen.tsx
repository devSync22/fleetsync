import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Checkbox, InfoBanner, KeyboardAwareScroll, TextField } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/theme';

import { BrandHeader } from '../components/BrandHeader';
import { PASSWORD_UPDATED_NOTICE } from '../hooks/useResetPassword';
import { useSignInForm } from '../hooks/useSignInForm';

/** Figma "Mobile — Sign in (Driver & Mechanic)", with the error state from "Login — error". */
export function SignInScreen() {
  const form = useSignInForm();
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const showPasswordUpdated = notice === PASSWORD_UPDATED_NOTICE && !form.banner;

  function openForgotPassword() {
    const email = form.values.email.trim();
    router.push({ pathname: '/forgot-password', params: email ? { email } : {} });
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <BrandHeader />

        <View style={styles.titles}>
          <Text style={typography.hero} accessibilityRole="header">
            Sign in
          </Text>
          <Text style={[typography.body, styles.muted]}>
            Use the email and password from your account email. Your trips or maintenance jobs open after you sign
            in.
          </Text>
        </View>

        {showPasswordUpdated ? (
          <InfoBanner tone="success" title="Password updated" message="Sign in with your new password." />
        ) : null}
        {form.banner ? <InfoBanner tone="danger" title={form.banner.title} message={form.banner.message} /> : null}

        <TextField
          label="Email address"
          value={form.values.email}
          onChangeText={(text) => form.setField('email', text)}
          error={form.errors.email}
          placeholder="name@fleetms.lk"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="next"
        />
        <TextField
          label="Password"
          value={form.values.password}
          onChangeText={(text) => form.setField('password', text)}
          error={form.errors.password}
          placeholder="Your password"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={form.submit}
        />

        <View style={styles.options}>
          <Checkbox
            label="Keep me signed in"
            size="sm"
            checked={form.keepSignedIn}
            onChange={form.setKeepSignedIn}
            style={styles.keepSignedIn}
          />
          <Pressable accessibilityRole="link" onPress={openForgotPassword} hitSlop={spacing.lg}>
            <Text style={typography.link}>Forgot password?</Text>
          </Pressable>
        </View>

        <Button label="Sign in" onPress={form.submit} loading={form.submitting} />

        <View style={styles.spacer} />

        <View style={styles.requestCard}>
          <Text style={typography.bodyStrong}>New driver or mechanic?</Text>
          <Text style={[typography.bodySmall, styles.muted, styles.center]}>
            Send a request. A Fleet Administrator reviews it and emails you when your account is ready.
          </Text>
          <Button label="Request an account" variant="secondary" onPress={() => router.push('/request-account')} />
        </View>

        <Text style={[typography.caption, styles.faint, styles.center]}>Customers sign in on the website.</Text>
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
    paddingTop: spacing.lg,
  },
  muted: {
    color: colors.muted,
  },
  faint: {
    color: colors.faint,
  },
  center: {
    textAlign: 'center',
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  keepSignedIn: {
    flex: 1,
  },
  spacer: {
    flexGrow: 1,
  },
  requestCard: {
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
    borderRadius: radii.card,
    backgroundColor: colors.background,
  },
});
