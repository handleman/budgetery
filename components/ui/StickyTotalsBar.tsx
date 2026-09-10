import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export type TotalsBarItem = { label: string; value: string | number; testID?: string };

/**
 * StickyTotalsBar — fixed footer rendered as a sibling OUTSIDE the scroll
 * view so totals stay visible while the list scrolls (usecase: totals
 * "sticked to bottom on scroll as bottom navbar" on income/obligations/expenses).
 */
export function StickyTotalsBar({ items, testID }: { items: TotalsBarItem[]; testID?: string }) {
  const background = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');
  const border = useThemeColor({ light: '#E5E5E5', dark: '#333333' }, 'background');
  return (
    <View style={[styles.bar, { backgroundColor: background, borderTopColor: border }]} testID={testID}>
      {items.map((item) => (
        <View key={item.label} style={styles.item} testID={item.testID}>
          <ThemedText style={styles.label}>{item.label}</ThemedText>
          <ThemedText type="defaultSemiBold">{String(item.value)}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
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
