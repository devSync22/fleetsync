import { useLocalSearchParams, useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { DetailRow } from '@/components/ui/DetailRow'
import { Icon } from '@/components/ui/Icon'
import { Screen } from '@/components/ui/Screen'
import { Colors, Fonts, Radius } from '@/constants/theme'
import { VerticalProgress } from '@/features/auth/components/VerticalProgress'
import { roleLabels } from '@/features/auth/constants'
import type { MobileRole } from '@/features/auth/types'
import { formatDateTime, formatShortDateTime } from '@/features/auth/utils/format'

/** Route params passed by the request-account screen after a successful submit. */
type RequestSentParams = {
  firstName?: string
  role?: MobileRole
  /** ISO timestamp of when the request was sent. */
  sentAt?: string
  /** Server-issued ID (e.g. "APP-2026-0118"); missing until the API exists. */
  requestId?: string
}

/**
 * "Mobile — Request sent (Driver & Mechanic)" — Figma node 195:6914.
 * Confirms the account request and explains what happens next.
 */
export default function RequestSentScreen() {
  const router = useRouter()
  const { firstName, role, sentAt, requestId } = useLocalSearchParams<RequestSentParams>()
  // Falls back to "now" if the screen is opened without params (e.g. during development).
  const sentDate = sentAt ? new Date(sentAt) : new Date()

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.successIcon}>
        <Icon source={require('@/assets/icons/check-success-lg.svg')} size={32} />
      </View>

      <Text style={styles.title} accessibilityRole="header">
        Request sent
      </Text>
      <Text style={styles.message}>
        {firstName ? `Thanks, ${firstName}. ` : 'Thanks. '}A Fleet Administrator will review
        your request. When it is approved you get an email with your sign-in details.
      </Text>

      <View style={styles.summary}>
        {/* The ID comes from the server, so this row is hidden until the API provides it. */}
        {requestId && <DetailRow label="Request ID" value={requestId} monospace />}
        {role && <DetailRow label="Role" value={roleLabels[role]} />}
        <DetailRow label="Sent" value={formatDateTime(sentDate)} />
      </View>

      {/* Right after sending, the request is always waiting for review (step 2). */}
      <VerticalProgress
        steps={[
          { title: 'Request sent', description: formatShortDateTime(sentDate), status: 'done' },
          { title: 'Under review', description: 'Usually within 2 working days', status: 'current' },
          {
            title: 'Account ready',
            description: 'You get an email with your sign-in details',
            status: 'upcoming',
          },
        ]}
      />

      {/* `replace` so going back doesn't return to this confirmation. */}
      <Button label="Back to sign in" onPress={() => router.replace('/sign-in')} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  // Content is vertically centred, as in the design.
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingTop: 16,
  },
  successIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.successSoft,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.26,
    color: Colors.textDefault,
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  summary: {
    alignSelf: 'stretch',
    gap: 12,
    padding: 16,
    borderRadius: Radius.xxl,
    backgroundColor: Colors.background,
  },
})
