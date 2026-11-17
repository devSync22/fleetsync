import { StyleSheet, Text, View } from 'react-native'

import { Colors, Fonts } from '@/constants/theme'

/** done = solid green dot, current = blue ring, upcoming = grey ring. */
export type ProgressStatus = 'done' | 'current' | 'upcoming'

export type ProgressStep = {
  title: string
  description: string
  status: ProgressStatus
}

/**
 * Vertical timeline on "Request sent" (Figma node 195:6952): a 14px dot per
 * step, joined by a 2px line (green after a done step, grey otherwise).
 */
export function VerticalProgress({ steps }: { steps: ProgressStep[] }) {
  return (
    <View style={styles.list} accessibilityRole="list">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <View
            key={step.title}
            style={styles.step}
            // Read as e.g. "Under review, current step, Usually within 2 working days".
            accessible
            accessibilityLabel={`${step.title}, ${statusLabel[step.status]}, ${step.description}`}
          >
            <View style={styles.track}>
              <View style={[styles.dot, dotStyles[step.status]]} />
              {!isLast && (
                <View style={[styles.line, step.status === 'done' && styles.lineDone]} />
              )}
            </View>
            <View style={[styles.text, !isLast && styles.textSpaced]}>
              <Text style={[styles.title, step.status === 'upcoming' && styles.muted]}>
                {step.title}
              </Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}

const statusLabel: Record<ProgressStatus, string> = {
  done: 'done',
  current: 'current step',
  upcoming: 'not yet',
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    gap: 12,
  },
  track: {
    alignItems: 'center',
    width: 14,
  },
  dot: {
    width: 14,
    height: 14,
    borderWidth: 2,
    borderRadius: 7,
  },
  // The line fills the rest of the row height, reaching the next dot.
  line: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
  },
  lineDone: {
    backgroundColor: Colors.success,
  },
  text: {
    flex: 1,
    gap: 1,
  },
  // Space between steps; with the line, this matches the design's 44px step height.
  textSpaced: {
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: Colors.textDefault,
  },
  muted: {
    color: Colors.textMuted,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
})

const dotStyles = StyleSheet.create({
  done: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  current: {
    borderColor: Colors.info,
    backgroundColor: Colors.infoSoft,
  },
  upcoming: {
    borderColor: Colors.line,
    backgroundColor: Colors.surface,
  },
})
