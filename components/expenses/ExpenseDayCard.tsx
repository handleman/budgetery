import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { AppCard, AppDivider, AppListRow } from '../ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { DayGroup } from '@/store/expenseGrouping';
import { formatDayKey } from '@/store/expenseGrouping';

type Props = {
  group: DayGroup;
  warned: boolean;
  overrunFrom?: string;
  expanded: boolean;
  onToggle: () => void;
  onEditItem: (visibleIndex: number) => void;
};

/**
 * ExpenseDayCard — expandable card of one day's expenses. Warned days
 * (over daily budget + overlap window) render pale-red from the theme.
 */
export function ExpenseDayCard({ group, warned, overrunFrom, expanded, onToggle, onEditItem }: Props) {
  const warnBg = useThemeColor({ light: '#FDECEA', dark: '#57201C' }, 'background');
  const testID = `expenses-day-${group.dayKey}${warned ? '-warned' : ''}`;
  return (
    <AppCard
      testID={testID}
      style={warned ? { backgroundColor: warnBg } : undefined}
    >
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" onPress={onToggle}>
          {formatDayKey(group.dayKey)} — {group.total} ({group.items.length})
          {warned ? ' ⚠' : ''}
        </ThemedText>
        <ThemedText onPress={onToggle}>{expanded ? '▾' : '▸'}</ThemedText>
      </View>
      {warned && overrunFrom && overrunFrom !== group.dayKey && (
        <ThemedText style={styles.note}>Over budget overlap from {formatDayKey(overrunFrom)}</ThemedText>
      )}
      {expanded && (
        <View>
          {group.items.map(({ item, listIndex }, i) => (
            <View key={`${item.date.getTime()}-${i}`}>
              <AppListRow
                title={`${item.label} — ${item.amount}`}
                testID={`expenses-row-${listIndex}`}
                onPress={() => onEditItem(listIndex)}
              />
              <AppDivider />
            </View>
          ))}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  note: {
    fontSize: 12,
    opacity: 0.7,
  },
});
