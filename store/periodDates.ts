import type { Store } from './types';
import { parseDayKeyStrict, toDayKey } from './expenseGrouping';

/**
 * Period-aware entry dates.
 *
 * Problem it solves: add-modals used to default every date to "today", so an
 * expense added while a past period (e.g. February) was selected got stamped
 * with that period but dated in September — the day cards showed it under a
 * September date while the period-month day-by-day breakdown showed 0s.
 *
 * Rules (also mirrored in docs/design/usecases.md):
 * - Default date = today when today lies in the active period month,
 *   otherwise the 1st of the period month.
 * - Submit-time dates are clamped into the period month: [month start,
 *   month end], except the cap is today when the period is the current
 *   month (future dates stay disallowed there).
 * - The visual calendar (AppDatePicker validRange) follows the same bounds.
 */

export type PeriodMonth = {
    /** 1-12 */
    month: number;
    year: number;
};

type PeriodSource = Pick<Store, 'periods' | 'currentPeriodId' | 'currentPeriod'>;

function isValidMonth(month: number): boolean {
    return Number.isInteger(month) && month >= 1 && month <= 12;
}

function isValidYear(year: number): boolean {
    return Number.isInteger(year) && year > 0;
}

/** Active period's calendar month; falls back to legacy currentPeriod, then today. */
export function activePeriodMonthYear(store: PeriodSource, today: Date = new Date()): PeriodMonth {
    const record = store.periods.find((p) => p.id === store.currentPeriodId);
    const month = record?.month ?? store.currentPeriod.month;
    const year = record?.year ?? today.getFullYear();
    if (isValidMonth(month) && isValidYear(year)) return { month, year };
    return { month: today.getMonth() + 1, year: today.getFullYear() };
}

/** Start (00:00 day 1) and end (23:59:59.999 last day) of a calendar month. */
export function periodMonthBounds(month: number, year: number): { start: Date; end: Date } {
    const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
}

/** True when `today` falls inside the given period month. */
export function isCurrentPeriodMonth(month: number, year: number, today: Date = new Date()): boolean {
    return today.getFullYear() === year && today.getMonth() + 1 === month;
}

/**
 * Default entry date for a period: today when it lies in the period month,
 * otherwise the 1st of the period month.
 */
export function defaultDateForPeriod(month: number, year: number, today: Date = new Date()): Date {
    if (isCurrentPeriodMonth(month, year, today)) return new Date(today);
    return new Date(year, month - 1, 1, 12, 0, 0);
}

export function defaultDayKeyForPeriod(month: number, year: number, today: Date = new Date()): string {
    return toDayKey(defaultDateForPeriod(month, year, today));
}

/**
 * Submit-time parse for a period: strict YYYY-MM-DD parse (fallback = period
 * default), then clamped into the period month so every saved item lands in
 * its period — the day-by-day breakdown always reflects period expenses.
 * Invalid month/year falls back to the legacy parseDateInput behavior.
 */
export function parseDateInputForPeriod(text: string, month: number, year: number, today: Date = new Date()): Date {
    if (!isValidMonth(month) || !isValidYear(year)) {
        const parsed = parseDayKeyStrict(text);
        return parsed ?? new Date(today);
    }
    const fallback = defaultDateForPeriod(month, year, today);
    const parsed = parseDayKeyStrict(text) ?? new Date(fallback);
    const { start, end } = periodMonthBounds(month, year);
    const cap = isCurrentPeriodMonth(month, year, today)
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
        : end;
    if (parsed.getTime() < start.getTime()) return start;
    if (parsed.getTime() > cap.getTime()) return new Date(cap);
    return parsed;
}
