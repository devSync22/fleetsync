import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts, Radius } from '@/constants/theme'

type CompletedStep = {
  label: string
  /** Short date under the label, e.g. "17 Oct". */
  date: string
}

/**
 * Horizontal "Sent — Reviewed — Approved" strip on "Account approved"
 * (Figma "Steps", node 198:6835). All steps are complete on this screen,
 * so every step shows a green check joined by green lines.
 */
export function StepStrip({ steps }: { steps: CompletedStep[] }) {
  return (
    <View style={styles.strip}>
      {steps.map((step, index) => (
        <View
          key={step.label}
          style={styles.step}
          accessible
          accessibilityLabel={`${step.label} ${step.date}, done`}
        >
          <View style={styles.check}>
            <Icon source={require('@/assets/icons/check-white.svg')} size={12} />
          </View>
          <View>
            <Text style={styles.label}>{step.label}</Text>
            <Text style={styles.date}>{step.date}</Text>
          </View>
          {/* Connector to the next step (none after the last one). */}
          {index < steps.length - 1 && <View style={styles.connector} />}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: Radius.xl,
    backgroundColor: Colors.background,
  },
  // Each step takes an equal share of the width; the connector fills what's left.
  step: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  check: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: Colors.textDefault,
  },
  date: {
    fontFamily: Fonts.regular,
    fontSize: 10,
    color: Colors.textMuted,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.success,
  },
})
