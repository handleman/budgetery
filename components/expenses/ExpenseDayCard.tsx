import * as React from 'react';
import { View } from 'react-native';
import { AppAccordion, AppCard, AppDivider, AppListRow } from '../ui';
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
  const testID = `expenses-day-${group.dayKey}${warned ? '-warned' : ''}`;
  const title = `${formatDayKey(group.dayKey)} — ${group.total} (${group.items.length})${warned ? ' ⚠' : ''}`;
  const description =
    warned && overrunFrom && overrunFrom !== group.dayKey
      ? `Over budget overlap from ${formatDayKey(overrunFrom)}`
      : undefined;
  return (
    <AppCard
      testID={testID}
      style={warned ? { backgroundColor: warnBg } : undefined}
    >
      <AppAccordion
        title={title}
        description={description}
        expanded={expanded}
        onPress={onToggle}
      >
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
      </AppAccordion>
    </AppCard>
  );
}
