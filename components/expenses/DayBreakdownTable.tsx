import * as React from 'react';
import { DataTable } from 'react-native-paper';
import type { StyleProp, ViewStyle } from 'react-native';
import { AppAccordion, AppCard } from '../ui';
import { useThemeColor } from '@/hooks/useThemeColor';
import type { DayGroup } from '@/store/expenseGrouping';

type Props = {
  groups: DayGroup[];
  daylyBudget: number;
  /** 1–12 */
  month: number;
  year: number;
  /** Collapsed by default — the table is long; the user expands it on demand. */
  expanded: boolean;
  onToggle: () => void;
  /** Outer Card overrides (e.g. narrow full-bleed). */
  style?: StyleProp<ViewStyle>;
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export type BreakdownRow = {
  day: number;
  dayKey: string;
  budget: number;
  spent: number;
  /** Running period balance up to this day. */
  left: number;
  /** True while the running balance is negative (overdrawn). */
  negative: boolean;
};

/**
 * Pure running-balance math (unit-tested): every day adds the allotted daily
 * budget and subtracts that day's expenses. Once a day overshoots severely,
 * all following days stay negative until the daily allotments recover them.
 */
export function buildBreakdownRows(
  spentByDay: Map<string, number>,
  daylyBudget: number,
  month: number,
  year: number,
): BreakdownRow[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daily = round2(daylyBudget);
  let running = 0;
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dayKey = `${year}-${pad(month)}-${pad(day)}`;
    const spent = round2(spentByDay.get(dayKey) ?? 0);
    running = round2(running + daily - spent);
    return { day, dayKey, budget: daily, spent, left: running, negative: running < 0 };
  });
}

/**
 * Day-by-day budget breakdown for the current period month (P12).
 * `Left` is the running period balance (previous Left + daily budget −
 * today's spent), so a severe overshoot drags all following days negative
 * until recovered; negative rows render pale-red.
 * Collapsed by default (long table); expands on demand via the header.
 */
export function DayBreakdownTable({ groups, daylyBudget, month, year, expanded, onToggle, style }: Props) {
  const overdrawnBg = useThemeColor({ light: '#FDECEA', dark: '#57201C' }, 'background');
  const rows = React.useMemo(() => {
    const spentByDay = new Map(groups.map((group) => [group.dayKey, group.total]));
    return buildBreakdownRows(spentByDay, daylyBudget, month, year);
  }, [groups, daylyBudget, month, year]);

  return (
    <AppCard testID="expenses-day-table" style={style}>
      <AppAccordion
        title="Day-by-day breakdown"
        description={`${rows.length} days`}
        expanded={expanded}
        onPress={onToggle}
        testID="expenses-day-table-toggle"
      >
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Day</DataTable.Title>
            <DataTable.Title numeric>Budget</DataTable.Title>
            <DataTable.Title numeric>Spent</DataTable.Title>
            <DataTable.Title numeric>Left</DataTable.Title>
          </DataTable.Header>
          {rows.map((row) => (
            <DataTable.Row
              key={row.dayKey}
              testID={`expenses-day-table-row-${row.dayKey}`}
              style={row.negative ? { backgroundColor: overdrawnBg } : undefined}
            >
              <DataTable.Cell>{row.day}</DataTable.Cell>
              <DataTable.Cell numeric>{row.budget}</DataTable.Cell>
              <DataTable.Cell numeric>{row.spent}</DataTable.Cell>
              <DataTable.Cell numeric>{row.left}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </AppAccordion>
    </AppCard>
  );
}
