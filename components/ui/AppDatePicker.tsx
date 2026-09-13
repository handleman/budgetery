import * as React from 'react';
import { DatePickerInput, en, registerTranslation } from 'react-native-paper-dates';
import { parseDateInput, toDayKey } from '@/store/expenseGrouping';

registerTranslation('en', en);

type Props = {
  /** Date as `YYYY-MM-DD` day key. */
  value: string;
  onChange: (dayKey: string) => void;
  label?: string;
  /** Stable selector root: field keeps `testID`, calendar icon gets `${testID}-icon-button`. */
  testID?: string;
};

/**
 * Adapter: visual date field (Paper text input + calendar modal from
 * `react-native-paper-dates`). Works on every platform (native + web +
 * static export) — no native date-picker module needed. Future dates are
 * disabled in the calendar; submit-time parsing clamps them as well.
 * Reusable for income/obligations once they need visual date entry.
 */
export function AppDatePicker({ value, onChange, label = 'Date', testID }: Props) {
  const date = React.useMemo(() => parseDateInput(value), [value]);
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
      validRange={{ endDate: today }}
      testID={testID}
    />
  );
}
