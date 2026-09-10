import { IncomeItem, Store } from './types';
import { visibleIncome } from './reducer';

export type IncomeProjection = {
  label: string;
  avgAmount: number;
  occurrences: number;
  /** Most common day-of-month the income arrived on (1-31). */
  modalDay: number;
};

/**
 * Salary projection engine (date-pattern): groups prior-period income by
 * label, computing average amount + modal day-of-month so the current
 * month can list "expected" items. Only items from OTHER periods count —
 * current-period items are actuals, not projections.
 */
export function projectIncome(store: Store): IncomeProjection[] {
  const currentId = store.currentPeriodId ?? null;
  const prior = store.incomeItems.filter((i) => {
    if (!currentId) return false; // no period scoping → no history to project from
    return i.periodId !== undefined && i.periodId !== null && i.periodId !== '' && i.periodId !== currentId;
  });
  if (prior.length === 0) return [];

  const currentLabels = new Set(visibleIncome(store).map((i) => i.label.toLowerCase()));
  const byLabel = new Map<string, IncomeItem[]>();
  for (const item of prior) {
    const key = item.label.toLowerCase();
    if (currentLabels.has(key)) continue; // already entered this month
    const list = byLabel.get(key);
    if (list) list.push(item);
    else byLabel.set(key, [item]);
  }

  const projections: IncomeProjection[] = [];
  for (const [, items] of byLabel) {
    const avgAmount = Math.round((items.reduce((acc, i) => acc + i.amount, 0) / items.length) * 100) / 100;
    const dayCounts = new Map<number, number>();
    for (const item of items) {
      const day = item.date.getDate();
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    let modalDay = items[0].date.getDate();
    let best = 0;
    for (const [day, count] of dayCounts) {
      if (count > best) {
        best = count;
        modalDay = day;
      }
    }
    projections.push({ label: items[0].label, avgAmount, occurrences: items.length, modalDay });
  }
  return projections.sort((a, b) => b.occurrences - a.occurrences);
}
