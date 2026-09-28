import { toDayKey } from './expenseGrouping';
import {
  activePeriodMonthYear,
  defaultDateForPeriod,
  defaultDayKeyForPeriod,
  isCurrentPeriodMonth,
  parseDateInputForPeriod,
  periodMonthBounds,
} from './periodDates';
import type { Store } from './types';

// Fixed "today": 2026-09-28 noon — deterministic regardless of runner date.
const TODAY = new Date(2026, 8, 28, 12, 0, 0);

function storeWith(periods: Store['periods'], currentPeriodId: string | null, month = 9): Store {
  return {
    periods,
    currentPeriodId,
    currentPeriod: { name: 'September', month },
  } as Store;
}

describe('periodDates', () => {
  it('activePeriodMonthYear prefers the selected record, falls back to legacy then today', () => {
    const periods = [{ id: '2026-2-february', name: 'February', month: 2, year: 2026 }];
    expect(activePeriodMonthYear(storeWith(periods, '2026-2-february'), TODAY)).toEqual({ month: 2, year: 2026 });
    // Unknown id → legacy currentPeriod month + today's year.
    expect(activePeriodMonthYear(storeWith(periods, 'missing'), TODAY)).toEqual({ month: 9, year: 2026 });
    // Invalid legacy month → today's month.
    expect(activePeriodMonthYear(storeWith([], null, 0), TODAY)).toEqual({ month: 9, year: 2026 });
  });

  it('periodMonthBounds spans the full calendar month', () => {
    const feb = periodMonthBounds(2, 2026);
    expect(toDayKey(feb.start)).toBe('2026-02-01');
    expect(toDayKey(feb.end)).toBe('2026-02-28');
    expect(isCurrentPeriodMonth(9, 2026, TODAY)).toBe(true);
    expect(isCurrentPeriodMonth(2, 2026, TODAY)).toBe(false);
  });

  it('defaultDateForPeriod is today in-period, 1st of month otherwise', () => {
    expect(toDayKey(defaultDateForPeriod(9, 2026, TODAY))).toBe('2026-09-28');
    expect(toDayKey(defaultDateForPeriod(2, 2026, TODAY))).toBe('2026-02-01');
    // Future period also defaults to its 1st (calendar range covers it).
    expect(toDayKey(defaultDateForPeriod(10, 2026, TODAY))).toBe('2026-10-01');
    expect(defaultDayKeyForPeriod(2, 2026, TODAY)).toBe('2026-02-01');
  });

  it('parseDateInputForPeriod keeps in-month dates, clamps out-of-month into the period', () => {
    // February period: mid-month kept, March clamped to Feb end, January to Feb start.
    expect(toDayKey(parseDateInputForPeriod('2026-02-14', 2, 2026, TODAY))).toBe('2026-02-14');
    expect(toDayKey(parseDateInputForPeriod('2026-03-05', 2, 2026, TODAY))).toBe('2026-02-28');
    expect(toDayKey(parseDateInputForPeriod('2026-01-20', 2, 2026, TODAY))).toBe('2026-02-01');
    // Garbage falls back to the period default (Feb 1st).
    expect(toDayKey(parseDateInputForPeriod('garbage', 2, 2026, TODAY))).toBe('2026-02-01');
  });

  it('parseDateInputForPeriod still disallows future dates in the current period', () => {
    // Oct 15 is future relative to TODAY (Sep 28) and outside September → clamped to today.
    expect(toDayKey(parseDateInputForPeriod('2026-10-15', 9, 2026, TODAY))).toBe('2026-09-28');
    expect(toDayKey(parseDateInputForPeriod('2026-09-10', 9, 2026, TODAY))).toBe('2026-09-10');
    // Future period month keeps its own dates (calendar range covers the month).
    expect(toDayKey(parseDateInputForPeriod('2026-10-15', 10, 2026, TODAY))).toBe('2026-10-15');
  });
});
