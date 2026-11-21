import { StyleSheet, Text, View } from 'react-native';

import {
  ActionBar,
  InfoBanner,
  KeyboardAwareScroll,
  PasswordRules,
  PasswordStrengthMeter,
  ScreenHeader,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography } from '@/theme';

import { useChangePassword } from '../hooks/useChangePassword';

type ChangePasswordScreenProps = {
  /** Called after the password changed; the route decides where to go (driver or mechanic Profile). */
  onUpdated: (changedAt: string) => void;
};

/** Driver & Mechanic — Change password (Figma 453:21767). */
export function ChangePasswordScreen({ onUpdated }: ChangePasswordScreenProps) {
  const { user } = useAuth();
  const form = useChangePassword(onUpdated);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Change password" subtitle={user ? [user.name, user.staffId].filter(Boolean).join(' · ') : undefined} />
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <TextField
          label="Current password"
          value={form.values.current}
          onChangeText={(text) => form.setField('current', text)}
          invalid={Boolean(form.errors.current)}
          helperText={form.errors.current}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
        />
        <View style={styles.group}>
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
        <PasswordRules checks={form.passwordChecks} />
        <Text style={typography.caption}>
          Forgot your current password? Sign out and use “Forgot password?” on the sign-in screen.
        </Text>
        {form.submitError ? (
          <InfoBanner tone="danger" title="Couldn’t update your password" message={form.submitError} />
        ) : null}
      </KeyboardAwareScroll>
      <ActionBar
        label="Update password"
        onPress={form.submit}
        loading={form.submitting}
        hint="You stay signed in on this phone. Other devices are signed out."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  group: {
    gap: spacing.md,
  },
});
