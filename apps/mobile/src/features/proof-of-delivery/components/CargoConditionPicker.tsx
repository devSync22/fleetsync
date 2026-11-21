import { StyleSheet, View } from 'react-native';

import { Chip, FormSection } from '@/components/ui';
import { spacing } from '@/theme';

import { CARGO_CONDITIONS } from '../constants';
import type { CargoCondition } from '../types';

type CargoConditionPickerProps = {
  value: CargoCondition;
  onChange: (value: CargoCondition) => void;
  /** Right-hand summary — "Medicines in 40 cool boxes · 2.1 t". */
  cargoSummary: string;
};

/** "Cargo received": All received / Some missing / Damaged. */
export function CargoConditionPicker({ value, onChange, cargoSummary }: CargoConditionPickerProps) {
  return (
    <FormSection title="Cargo received" meta={cargoSummary}>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Cargo received">
        {CARGO_CONDITIONS.map((condition) => (
          <Chip
            key={condition}
            variant="choice"
            label={condition}
            selected={condition === value}
            onPress={() => onChange(condition)}
          />
        ))}
      </View>
    </FormSection>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
