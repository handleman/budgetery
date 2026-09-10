import { DayGroup } from './expenseGrouping';

export type DayWarning = {
  dayKey: string;
  warned: boolean;
  /** Day total that triggered the warning (overrun source), if any. */
  overrunFrom?: string;
};

function calendarDiffDays(from: Date, to: Date): number {
  const a = new Date(from); a.setHours(0, 0, 0, 0);
  const b = new Date(to); b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/**
 * Overlap warning algorithm (usecase: big expense spreads forward).
 *
 * Rule (decided): for each day with `dayTotal > daylyBudget`,
 * `spread = ceil((dayTotal − daylyBudget) / daylyBudget)` (min 1).
 * That day + the next `spread` calendar days render warned — only days
 * that have expense cards are flagged; gap days have no card.
 * A warned day that itself overshoots extends the window from that day
 * (accumulation: new expenses inside the window add to the overrun).
 * After the window expires, cards render normal. No budget (<=0) → no warnings.
 */
export function computeOverlapWarnings(dayGroups: DayGroup[], daylyBudget: number): Map<string, DayWarning> {
  const result = new Map<string, DayWarning>();
  if (!Number.isFinite(daylyBudget) || daylyBudget <= 0 || dayGroups.length === 0) {
    return result;
  }

  const ascending = [...dayGroups].sort((a, b) => (a.dayKey < b.dayKey ? -1 : 1));
  // Windows opened by overshooting days: { source, startDate, spread }.
  const windows: { source: string; start: Date; spread: number }[] = [];
  for (const group of ascending) {
    if (group.total > daylyBudget) {
      const spread = Math.max(1, Math.ceil((group.total - daylyBudget) / daylyBudget));
      windows.push({ source: group.dayKey, start: group.date, spread });
    }
  }

  for (const group of ascending) {
    const covering = windows.filter(
      (w) => calendarDiffDays(w.start, group.date) >= 0 && calendarDiffDays(w.start, group.date) <= w.spread,
    );
    const latest = covering.length > 0 ? covering[covering.length - 1].source : undefined;
    result.set(group.dayKey, { dayKey: group.dayKey, warned: latest !== undefined, overrunFrom: latest });
  }
  return result;
}
