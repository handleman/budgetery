import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppAccordion, AppCard, AppChip, AppDivider, AppListRow, glyphForLabel } from '../ui';
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
 * ExpenseDayCard — expandable day section (Paper Accordion inside a Card).
 * Warned days (over daily budget + overlap window) render pale-red.
 */
export function ExpenseDayCard({ group, warned, overrunFrom, expanded, onToggle, onEditItem }: Props) {
  const warnBg = useThemeColor({ light: '#FDECEA', dark: '#57201C' }, 'background');
  const stripBg = useThemeColor({ light: '#EDEAF4', dark: '#2A2830' }, 'background');
  const testID = `expenses-day-${group.dayKey}${warned ? '-warned' : ''}`;
  const title = `${formatDayKey(group.dayKey)} — ${group.total} (${group.items.length})`;
  const description =
    warned && overrunFrom && overrunFrom !== group.dayKey
      ? `Over budget overlap from ${formatDayKey(overrunFrom)}`
      : undefined;
  return (
    <AppCard
      testID={testID}
      style={warned ? { backgroundColor: warnBg } : undefined}
    >
      {warned ? (
        <View style={styles.chipRow}>
          <AppChip label="Over budget" icon="alert" testID={`${testID}-chip`} />
        </View>
      ) : null}
      <AppAccordion
        title={title}
        description={description}
        expanded={expanded}
        onPress={onToggle}
        style={[styles.groupHeader, { backgroundColor: stripBg }]}
      >
        <View>
          {group.items.map(({ item, listIndex }, i) => (
            <View key={`${item.date.getTime()}-${i}`}>
              <AppListRow
                title={`${item.label} — ${item.amount}`}
                testID={`expenses-row-${listIndex}`}
                onPress={() => onEditItem(listIndex)}
                glyph={glyphForLabel(item.label)}
              />
              {i < group.items.length - 1 && <AppDivider />}
            </View>
          ))}
        </View>
      </AppAccordion>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  groupHeader: {
    borderRadius: 12,
    paddingHorizontal: 8,
    // Bleed to the card edges (Card.Content pads its children).
    marginHorizontal: -8,
  },
});
