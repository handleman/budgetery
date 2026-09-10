import { ExpenseItem } from './types';

export type DayGroup = {
  dayKey: string; // yyyy-mm-dd
  date: Date; // start of day
  total: number;
  /** Entries with index in the input (visible-period) array — pass to update/remove mutators. */
  items: { item: ExpenseItem; listIndex: number }[];
};

export function toDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateInput(text: string, fallback: Date = new Date()): Date {
  const trimmed = text.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) return fallback;
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0);
  if (Number.isNaN(parsed.getTime())) return fallback;
  // Clamp future dates to today — expenses are tracked for today or past days.
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (parsed.getTime() > today.getTime()) return new Date();
  return parsed;
}

export function formatDayKey(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Group visible-period expenses by calendar day, newest first. */
export function groupExpensesByDay(expenseItems: ExpenseItem[]): DayGroup[] {
  const withIndex = expenseItems.map((item, listIndex) => ({ item, listIndex }));
  const map = new Map<string, DayGroup>();
  for (const entry of withIndex) {
    const key = toDayKey(entry.item.date);
    const existing = map.get(key);
    if (existing) {
      existing.items.push(entry);
      existing.total += entry.item.amount;
    } else {
      const date = new Date(entry.item.date);
      date.setHours(0, 0, 0, 0);
      map.set(key, { dayKey: key, date, total: entry.item.amount, items: [entry] });
    }
  }
  return [...map.values()].sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
}

/** Parse "10, 20, 30" style comma-separated amounts into numbers. Invalid tokens are dropped. */
export function parseCommaAmounts(text: string): number[] {
  return text
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n !== 0);
}
