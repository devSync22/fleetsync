import { Delete } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/theme';

import { KeypadKey } from './KeypadKey';

type NumericKeypadProps = {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  /** Long-press on backspace clears the whole value. */
  onClear: () => void;
  disabled?: boolean;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

/** On-screen number pad for odometer readings (Driver — Start trip, Complete trip). */
export function NumericKeypad({ onDigit, onBackspace, onClear, disabled }: NumericKeypadProps) {
  return (
    <View style={styles.pad}>
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((digit) => (
            <KeypadKey key={digit} label={digit} accessibilityLabel={digit} onPress={() => onDigit(digit)} disabled={disabled} />
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <View style={styles.empty} />
        <KeypadKey label="0" accessibilityLabel="0" onPress={() => onDigit('0')} disabled={disabled} />
        <KeypadKey
          icon={Delete}
          accessibilityLabel="Delete last digit"
          onPress={onBackspace}
          onLongPress={onClear}
          disabled={disabled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  empty: {
    flex: 1,
  },
});
