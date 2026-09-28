import * as React from 'react';
import { DatePickerInput, en, registerTranslation } from 'react-native-paper-dates';
import { parseDayKeyStrict, toDayKey } from '@/store/expenseGrouping';

registerTranslation('en', en);

type Props = {
  /** Date as `YYYY-MM-DD` day key. */
  value: string;
  onChange: (dayKey: string) => void;
  label?: string;
  /** Stable selector root: field keeps `testID`, calendar icon gets `${testID}-icon-button`. */
  testID?: string;
  /**
   * Selectable range. Defaults to "up to today" (legacy: future dates are
   * disabled). Period-aware callers pass the active period month bounds so
   * the calendar opens on / allows the selected period (e.g. February while
   * today is in September).
   */
  startDate?: Date;
  endDate?: Date;
};

/**
 * Adapter: visual date field (Paper text input + calendar modal from
 * `react-native-paper-dates`). Works on every platform (native + web +
 * static export) — no native date-picker module needed. Submit-time parsing
 * clamps dates as well (see `parseDateInputForPeriod`).
 * Reusable for income/obligations once they need visual date entry.
 */
export function AppDatePicker({ value, onChange, label = 'Date', testID, startDate, endDate }: Props) {
  // Strict parse (no future clamping): the value may lie in a past/future period month.
  const date = React.useMemo(() => parseDayKeyStrict(value) ?? new Date(), [value]);
  const today = React.useMemo(() => {
    const t = new Date();
    t.setHours(23, 59, 59, 999);
    return t;
  }, []);
  const handleChange = (next: Date | undefined) => {
    if (next) onChange(toDayKey(next));
  };
  return (
    <DatePickerInput
      locale="en"
      label={label}
      value={date}
      onChange={handleChange}
      inputMode="start"
      mode="outlined"
      dense
      validRange={{ startDate, endDate: endDate ?? today }}
      testID={testID}
    />
  );
}
