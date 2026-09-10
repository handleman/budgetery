import * as React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { AppButton, AppCard, AppCardTitle, AppDivider } from '../ui';
import type { IncomeProjection } from '@/store/projections';

type Props = {
  projections: IncomeProjection[];
  onAdd: (projection: IncomeProjection) => void;
};

/** Lists expected monthly income based on prior months' date patterns. */
export function IncomeProjections({ projections, onAdd }: Props) {
  if (projections.length === 0) return null;
  return (
    <AppCard testID="income-projections">
      <AppCardTitle title="Expected this month" subtitle="based on prior months" />
      {projections.map((p, index) => (
        <View key={`${p.label}-${index}`}>
          <ThemedText>
            {p.label} — ~{p.avgAmount} (usually day {p.modalDay})
          </ThemedText>
          <AppButton
            title={`Add ${p.avgAmount}`}
            onPress={() => onAdd(p)}
            testID={`income-projection-add-${index}`}
          />
          <AppDivider />
        </View>
      ))}
    </AppCard>
  );
}
