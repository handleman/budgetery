import { groupExpensesByDay, parseCommaAmounts, toDayKey, parseDateInput, formatDayKey } from './expenseGrouping';
import { computeOverlapWarnings } from './expensesOverlap';
import { ExpenseItem } from './types';

function day(amount: number, iso: string): ExpenseItem {
  return { date: new Date(iso), amount, label: 'x' };
}

describe('expenseGrouping', () => {
  it('groups expenses by calendar day newest-first with totals', () => {
    const groups = groupExpensesByDay([
      day(10, '2026-10-01T10:00:00'),
      day(20, '2026-10-01T12:00:00'),
      day(5, '2026-10-02T09:00:00'),
    ]);
    expect(groups.length).toBe(2);
    expect(groups[0].dayKey).toBe('2026-10-02');
    expect(groups[0].total).toBe(5);
    expect(groups[1].dayKey).toBe('2026-10-01');
    expect(groups[1].total).toBe(30);
    expect(toDayKey(new Date('2026-10-01T23:59:59'))).toBe('2026-10-01');
  });

  it('parses comma-separated amounts and drops invalid tokens', () => {
    expect(parseCommaAmounts('10, 20, 30')).toEqual([10, 20, 30]);
    expect(parseCommaAmounts('50')).toEqual([50]);
    expect(parseCommaAmounts('10, abc, , 5')).toEqual([10, 5]);
  });

  it('parseDateInput accepts YYYY-MM-DD, clamps future, falls back on garbage', () => {
    const parsed = parseDateInput('2026-09-03');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    const future = parseDateInput('2999-01-01');
    expect(future.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    const fallback = new Date('2026-01-02T12:00:00');
    expect(parseDateInput('garbage', fallback)).toBe(fallback);
    expect(formatDayKey('2026-09-03').length).toBeGreaterThan(0);
  });
});

describe('expensesOverlap', () => {
  it('warns the overshooting day plus ceil(overrun/daily) following days', () => {
    // daily 100, day1 total 250 → overrun 150 → spread 2 → days 1,2,3 warned.
    const groups = groupExpensesByDay([
      day(250, '2026-10-01T10:00:00'),
      day(10, '2026-10-02T10:00:00'),
      day(10, '2026-10-03T10:00:00'),
      day(10, '2026-10-04T10:00:00'),
    ]);
    const warnings = computeOverlapWarnings(groups, 100);
    expect(warnings.get('2026-10-01')?.warned).toBe(true);
    expect(warnings.get('2026-10-02')?.warned).toBe(true);
    expect(warnings.get('2026-10-03')?.warned).toBe(true);
    expect(warnings.get('2026-10-04')?.warned).toBe(false);
  });

  it('extends the window when a warned day overshoots again (accumulation)', () => {
    const groups = groupExpensesByDay([
      day(250, '2026-10-01T10:00:00'),
      day(250, '2026-10-02T10:00:00'),
      day(10, '2026-10-05T10:00:00'),
    ]);
    const warnings = computeOverlapWarnings(groups, 100);
    expect(warnings.get('2026-10-02')?.warned).toBe(true);
    // Second window covers 10-02..10-04; 10-05 is outside.
    expect(warnings.get('2026-10-05')?.warned).toBe(false);
  });

  it('returns no warnings without a positive daily budget', () => {
    const groups = groupExpensesByDay([day(500, '2026-10-01T10:00:00')]);
    expect(computeOverlapWarnings(groups, 0).size).toBe(0);
    expect(computeOverlapWarnings([], 100).size).toBe(0);
  });

  it('leaves under-budget days normal', () => {
    const groups = groupExpensesByDay([day(40, '2026-10-01T10:00:00'), day(30, '2026-10-02T10:00:00')]);
    const warnings = computeOverlapWarnings(groups, 100);
    expect(warnings.get('2026-10-01')?.warned).toBe(false);
    expect(warnings.get('2026-10-02')?.warned).toBe(false);
  });
});
