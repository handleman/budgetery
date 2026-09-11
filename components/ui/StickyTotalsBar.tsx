import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { ThemedText } from '../ThemedText';

export type TotalsBarItem = { label: string; value: string | number; testID?: string };

/**
 * StickyTotalsBar — fixed footer rendered as a sibling OUTSIDE the scroll
 * view so totals stay visible while the list scrolls (usecase: totals
 * "sticked to bottom on scroll as bottom navbar" on income/obligations/expenses).
 * Container is a Paper Surface (elevation + theme background); layout stays custom
 * since Paper has no sticky-footer component.
 */
export function StickyTotalsBar({ items, testID }: { items: TotalsBarItem[]; testID?: string }) {
  return (
    <Surface style={styles.bar} testID={testID}>
      {items.map((item) => (
        <View key={item.label} style={styles.item} testID={item.testID}>
          <ThemedText style={styles.label}>{item.label}</ThemedText>
          <ThemedText type="defaultSemiBold">{String(item.value)}</ThemedText>
        </View>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
  },
});
