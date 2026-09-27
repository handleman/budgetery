import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard } from './AppCard';
import { ThemedText } from '../ThemedText';
import type { TotalsBarItem } from './StickyTotalsBar';

/**
 * SideTotalsCard — desktop companion to StickyTotalsBar (redesign mockups).
 * Same items + same testIDs (the two never render together: wide screens
 * show this card, narrow screens the sticky bar).
 */
export function SideTotalsCard({ items, testID }: { items: TotalsBarItem[]; testID?: string }) {
  return (
    <AppCard testID={testID} style={styles.card}>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.cell} testID={item.testID}>
            <ThemedText style={styles.label}>{item.label}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.value}>
              {String(item.value)}
            </ThemedText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    alignSelf: 'flex-start',
    marginTop: 32,
    marginRight: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
  },
  value: {
    textAlign: 'right',
  },
});
