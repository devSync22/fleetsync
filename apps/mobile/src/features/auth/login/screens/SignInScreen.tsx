import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Screen } from '@/components/ui/Screen'
import { TextField } from '@/components/ui/TextField'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { Wordmark } from '@/features/auth/login/components/Wordmark'
import { WEB_APP_URL } from '@/features/auth/login/constants'
import { isValidEmail } from '@/features/auth/shared/utils/validation'

/**
 * "Mobile — Sign in (Driver & Mechanic)" — Figma node 195:6721.
 * Drivers and mechanics sign in here; customers use the website.
 */
export default function SignInScreen() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  // Field errors only appear after the first submit attempt.
  const [submitted, setSubmitted] = useState(false)

  const emailError = !submitted
    ? undefined
    : !email.trim()
      ? 'Enter your email address'
      : !isValidEmail(email)
        ? 'Enter a valid email address'
        : undefined
  const passwordError = submitted && !password ? 'Enter your password' : undefined

  function handleSignIn() {
    setSubmitted(true)
    if (!email.trim() || !isValidEmail(email) || !password) return

    // TODO: call the sign-in API once the backend exists, with
    // { email: email.trim(), password, rememberMe: keepSignedIn }, then:
    //  - store the session (secure storage) and open the driver/mechanic home screen
    //  - show "Incorrect email or password" (see the web login error) on failure
  }

  async function handleForgotPassword() {
    // There's no mobile "forgot password" design; password resets happen on the website.
    if (!WEB_APP_URL) {
      Alert.alert('Reset your password', 'Use “Forgot password?” on the FleetSync website.')
      return
    }
    await WebBrowser.openBrowserAsync(`${WEB_APP_URL}/forgot-password`)
  }

  return (
    <Screen contentStyle={styles.content}>
      <Wordmark />

      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Sign in
        </Text>
        <Text style={styles.subtitle}>
          Use the email and password from your account email. Your trips or maintenance jobs
          open after you sign in.
        </Text>
      </View>

      <TextField
        label="Email address"
        value={email}
        onChangeText={setEmail}
        placeholder="name@fleetsync.lk"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        // Lets iOS/Android password managers fill the saved account.
        autoComplete="email"
        textContentType="username"
        returnKeyType="next"
        invalid={Boolean(emailError)}
        helperText={emailError}
      />

      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSignIn}
        invalid={Boolean(passwordError)}
        helperText={passwordError}
      />

      <View style={styles.options}>
        {/* Sent as `rememberMe` so the backend can issue a longer-lived session. */}
        <Checkbox label="Keep me signed in" checked={keepSignedIn} onChange={setKeepSignedIn} />
        <Pressable accessibilityRole="link" onPress={handleForgotPassword} hitSlop={8}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
      </View>

      <Button label="Sign in" onPress={handleSignIn} />

      {/* Pushes the sign-up card to the bottom of the screen on tall phones. */}
      <View style={styles.spacer} />

      {/* New staff can't sign up directly: they request an account for admin approval. */}
      <View style={styles.requestCard}>
        <Text style={styles.requestTitle}>New driver or mechanic?</Text>
        <Text style={styles.requestText}>
          Send a request. A Fleet Administrator reviews it and emails you when your account is
          ready.
        </Text>
        <Button
          label="Request an account"
          variant="secondary"
          onPress={() => router.push('/request-account')}
        />
      </View>

      <Text style={styles.footnote}>Customers sign in on the website.</Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 20,
    paddingTop: 40,
  },
  header: {
    gap: 6,
    paddingTop: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.28,
    color: Colors.textDefault,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textMuted,
  },
  options: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  link: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: Colors.accent,
  },
  spacer: {
    flexGrow: 1,
  },
  requestCard: {
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.background,
  },
  requestTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: Colors.textDefault,
  },
  requestText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.textFaint,
  },
})
