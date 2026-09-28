import * as React from 'react';
import { DataTable } from 'react-native-paper';
import { AppAccordion, AppCard } from '../ui';
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
};

const round2 = (value: number): number => Math.round(value * 100) / 100;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Day-by-day budget breakdown for the current period month (P12).
 * Every calendar day gets a row: allotted daily budget, actually spent,
 * and what's left — days without expenses show 0 spent.
 * Collapsed by default (long table); expands on demand via the header.
 */
export function DayBreakdownTable({ groups, daylyBudget, month, year, expanded, onToggle }: Props) {
  const rows = React.useMemo(() => {
    const spentByDay = new Map(groups.map((group) => [group.dayKey, group.total]));
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dayKey = `${year}-${pad(month)}-${pad(day)}`;
      const spent = spentByDay.get(dayKey) ?? 0;
      return { day, dayKey, budget: round2(daylyBudget), spent: round2(spent), left: round2(daylyBudget - spent) };
    });
  }, [groups, daylyBudget, month, year]);

  return (
    <AppCard testID="expenses-day-table">
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
            <DataTable.Row key={row.dayKey} testID={`expenses-day-table-row-${row.dayKey}`}>
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
