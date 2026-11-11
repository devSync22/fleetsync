import { StyleSheet, Text, View } from 'react-native'

import { Icon } from '@/components/ui/Icon'
import { Colors, Fonts } from '@/constants/theme'

import { mobilePasswordRules } from '../utils/validation'

/**
 * Live password rules under the password fields on "Account approved"
 * (Figma node 198:6889). Met rules turn green with a check; unmet rules
 * stay grey with the check faded.
 */
export function PasswordChecklist({ password }: { password: string }) {
  return (
    <View style={styles.list}>
      {mobilePasswordRules.map((rule) => {
        const met = rule.test(password)
        return (
          <View
            key={rule.id}
            style={styles.rule}
            accessible
            accessibilityLabel={`${rule.label}, ${met ? 'done' : 'not yet'}`}
          >
            <View style={!met && styles.iconUnmet}>
              <Icon
                source={require('@/assets/icons/check-success-sm.svg')}
                size={14}
                tintColor={met ? undefined : Colors.textFaint}
              />
            </View>
            <Text style={[styles.label, met && styles.labelMet]}>{rule.label}</Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
  },
  rule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconUnmet: {
    opacity: 0.6,
  },
  label: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  labelMet: {
    color: Colors.success,
  },
})
