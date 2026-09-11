import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { AppCard, AppCardTitle, AppCheckbox } from '../ui';

export type TutorialFlags = {
  welcome: boolean;
  income: boolean;
  obligations: boolean;
  expenses: boolean;
};

const STEPS: { key: keyof TutorialFlags; label: string; testID: string }[] = [
  { key: 'welcome', label: 'Welcome — pick a month', testID: 'tutorial-check-welcome' },
  { key: 'income', label: 'Income — add sources', testID: 'tutorial-check-income' },
  { key: 'obligations', label: 'Obligations — add recurring', testID: 'tutorial-check-obligations' },
  { key: 'expenses', label: 'Expenses — track daily', testID: 'tutorial-check-expenses' },
];

/**
 * TutorialProgress — checkbox checklist of the 4 tutorial flags so users
 * feel guided through welcome → income → obligations → expenses.
 */
export function TutorialProgress({ flags }: { flags: TutorialFlags }) {
  const done = STEPS.filter((s) => flags[s.key]).length;
  return (
    <AppCard testID="tutorial-progress">
      <AppCardTitle title="Getting started" subtitle={`${done} of ${STEPS.length} done`} />
      <View style={styles.list}>
        {STEPS.map((step) => (
          <View key={step.key} style={styles.row} testID={step.testID}>
            <AppCheckbox checked={flags[step.key]} />
            <ThemedText>{step.label}</ThemedText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
