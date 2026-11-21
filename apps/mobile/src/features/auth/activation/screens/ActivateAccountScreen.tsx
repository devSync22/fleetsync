import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { DetailRow } from '@/components/ui/DetailRow'
import { Icon } from '@/components/ui/Icon'
import { Screen } from '@/components/ui/Screen'
import { TextField } from '@/components/ui/TextField'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { PasswordChecklist } from '@/features/auth/activation/components/PasswordChecklist'
import { StepStrip } from '@/features/auth/activation/components/StepStrip'
import { roleLabels } from '@/features/auth/shared/constants'
import type { AccountApproval } from '@/features/auth/activation/types'
import { formatDate } from '@/features/auth/shared/utils/format'
import { meetsMobilePasswordRules } from '@/features/auth/activation/utils/passwordRules'
import { activateAccount, getAccountApproval } from '@/features/auth/services/authApi'

/** Hours the approval email link stays valid. Keep in sync with the backend. */
const ACTIVATION_LINK_VALID_HOURS = 48

/**
 * "Mobile — Account approved (Driver & Mechanic)" — Figma node 198:6766.
 * Opened from the link in the approval email (e.g. …/activate?token=…):
 * shows the approved account and lets the user create their password.
 */
export default function ActivateAccountScreen() {
  const router = useRouter()
  // One-time token from the approval email link; identifies the approved request.
  const { token } = useLocalSearchParams<{ token?: string }>()

  // The approved account behind the link (POST /api/auth/activation/lookup).
  const [approval, setApproval] = useState<AccountApproval>()
  /** Shown instead of the form when the link is missing, expired or already used. */
  const [linkError, setLinkError] = useState<string | undefined>(
    token ? undefined : 'This activation link is incomplete. Open it again from your approval email.',
  )
  const [activating, setActivating] = useState(false)
  const [activateError, setActivateError] = useState<string>()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    getAccountApproval(token)
      .then((details) => {
        if (!cancelled) setApproval(details)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLinkError(error instanceof Error ? error.message : 'This link has expired or was already used.')
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Errors only show after the first submit attempt.
  const [submitted, setSubmitted] = useState(false)

  const passwordError =
    submitted && !meetsMobilePasswordRules(password)
      ? 'Your password doesn’t meet all the rules below'
      : undefined
  const confirmError =
    submitted && password !== confirmPassword ? 'Passwords don’t match' : undefined

  async function handleActivate() {
    setSubmitted(true)
    if (!token || activating || !meetsMobilePasswordRules(password) || password !== confirmPassword) return

    setActivating(true)
    setActivateError(undefined)
    try {
      // POST /api/auth/activation creates the account; the user then signs in with the new password.
      await activateAccount(token, password)
      router.replace('/sign-in')
    } catch (error) {
      setActivateError(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
      setActivating(false)
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.successIcon}>
          <Icon source={require('@/assets/icons/check-success-md.svg')} size={26} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            Request approved
          </Text>
          <Text style={styles.subtitle}>
            Welcome to the fleet{approval ? `, ${approval.firstName}` : ''}
          </Text>
        </View>
      </View>

      {approval && (
        <>
          <StepStrip
            steps={[
              { label: 'Sent', date: formatDate(new Date(approval.sentAt), false) },
              { label: 'Reviewed', date: formatDate(new Date(approval.reviewedAt), false) },
              { label: 'Approved', date: formatDate(new Date(approval.approvedAt), false) },
            ]}
          />

          {/* What the administrator set up for this account. */}
          <View style={styles.accountCard}>
            <Text style={styles.cardLabel}>YOUR ACCOUNT</Text>
            <DetailRow label="Role" value={roleLabels[approval.role]} />
            {/* Staff ID and depot appear once staff management assigns them. */}
            {approval.staffId ? (
              <DetailRow
                label={approval.role === 'driver' ? 'Driver ID' : 'Mechanic ID'}
                value={approval.staffId}
                monospace
              />
            ) : null}
            {approval.depot ? <DetailRow label="Depot (assigned)" value={approval.depot} /> : null}
            <DetailRow label="Sign-in email" value={approval.signInEmail} />
            <DetailRow label="Approved by" value={approval.approvedBy} />
          </View>
        </>
      )}

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Create your password
      </Text>

      <TextField
        label="New password"
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••••••"
        secureTextEntry
        // Tells password managers this is a new password so they can suggest one.
        autoComplete="new-password"
        textContentType="newPassword"
        invalid={Boolean(passwordError)}
        helperText={passwordError}
      />
      <TextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="••••••••••••"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={() => void handleActivate()}
        invalid={Boolean(confirmError)}
        helperText={confirmError}
      />

      <PasswordChecklist password={password} />

      {/* Pushes the button to the bottom on tall phones. */}
      <View style={styles.spacer} />

      {linkError || activateError ? <Text style={styles.errorText}>{linkError ?? activateError}</Text> : null}
      <Button
        label="Activate account and sign in"
        onPress={() => void handleActivate()}
        loading={activating}
        disabled={Boolean(linkError)}
      />
      <Text style={styles.footnote}>
        This link from your approval email works for {ACTIVATION_LINK_VALID_HOURS} hours.
      </Text>
    </Screen>
  )
}

const styles = StyleSheet.create({
  errorText: {
    color: Colors.danger,
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  content: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.successSoft,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.textDefault,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
  },
  accountCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xxl,
  },
  cardLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 16,
    color: Colors.textDefault,
  },
  spacer: {
    flexGrow: 1,
  },
  footnote: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    textAlign: 'center',
    color: Colors.textMuted,
  },
})
