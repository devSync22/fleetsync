import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Screen } from '@/components/ui/Screen'
import { TextField } from '@/components/ui/TextField'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'
import { Wordmark } from '@/features/auth/login/components/Wordmark'
import { isValidEmail } from '@/features/auth/shared/utils/validation'

/**
 * "Mobile — Sign in (Driver & Mechanic)" — Figma node 195:6721.
 * Drivers and mechanics sign in here; customers use the website.
 */
export default function SignInScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(true)
  // Field errors only appear after the first submit attempt.
  const [submitted, setSubmitted] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  // Message from the sign-in service, e.g. "Incorrect email or password".
  const [signInError, setSignInError] = useState<string>()

  const emailError = !submitted
    ? undefined
    : !email.trim()
      ? 'Enter your email address'
      : !isValidEmail(email)
        ? 'Enter a valid email address'
        : undefined
  const passwordError = submitted && !password ? 'Enter your password' : signInError

  async function handleSignIn() {
    setSubmitted(true)
    if (signingIn || !email.trim() || !isValidEmail(email) || !password) return

    setSigningIn(true)
    setSignInError(undefined)
    try {
      // On success the root layout's route guards open the driver/mechanic area.
      await signIn({ email: email.trim(), password }, { keepSignedIn })
    } catch (error) {
      setSignInError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setSigningIn(false)
    }
  }

  function handleForgotPassword() {
    const trimmed = email.trim()
    router.push({ pathname: '/forgot-password', params: trimmed ? { email: trimmed } : {} })
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

      <Button label="Sign in" onPress={handleSignIn} loading={signingIn} />

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
