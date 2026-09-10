/**
 * Canonical testID map for E2E specs.
 * Every selector MUST come from here (getByTestId only).
 * If a flow needs an ID missing below, add the testID to app code first.
 */
export const tid = {
  welcome: {
    getStarted: 'welcome-get-started',
    monthPicker: 'month-picker',
    monthPickerAnchor: 'month-picker-anchor',
    monthOption: (month: number) => `month-picker-option-${month}`,
    periodLabelInput: 'period-label-input',
    apply: 'welcome-apply',
    startNewMonth: 'start-new-month-button',
    monthList: 'month-list',
    monthRow: (i: number) => `month-row-${i}`,
    tutorialProgress: 'tutorial-progress',
  },
  tabs: {
    income: 'tab-income',
    obligations: 'tab-obligations',
    expenses: 'tab-expenses',
  },
  income: {
    empty: 'income-empty',
    emptyAction: 'income-empty-action',
    fab: 'income-fab',
    listCard: 'income-list-card',
    totalsBar: 'income-totals-bar',
    totalsTotal: 'income-totals-bar-total',
    totalsRemaining: 'income-totals-bar-remaining',
    totalsDaily: 'income-totals-bar-daily',
    totalsRemains: 'income-totals-bar-remains',
    projections: 'income-projections',
    projectionAdd: (i: number) => `income-projection-add-${i}`,
    row: (i: number) => `income-row-${i}`,
    amountInput: 'income-amount-input',
    labelInput: 'income-label-input',
    dateInput: 'income-date-input',
    dialog: 'add-income-dialog',
  },
  obligations: {
    empty: 'obligations-empty',
    emptyAction: 'obligations-empty-action',
    fab: 'obligations-fab',
    listCard: 'obligations-list-card',
    totalsBar: 'obligations-totals-bar',
    totalsTotal: 'obligations-totals-bar-total',
    totalsRemaining: 'obligations-totals-bar-remaining',
    totalsDaily: 'obligations-totals-bar-daily',
    totalsRemains: 'obligations-totals-bar-remains',
    row: (i: number) => `obligations-row-${i}`,
    amountInput: 'obligation-amount-input',
    labelInput: 'obligation-label-input',
    dateInput: 'obligation-date-input',
    percentageSwitch: 'obligation-percentage-switch',
    recurringSwitch: 'obligation-recurring-switch',
    dialog: 'add-obligation-dialog',
  },
  expenses: {
    empty: 'expenses-empty',
    emptyAction: 'expenses-empty-action',
    fab: 'expenses-fab',
    totalsBar: 'expenses-totals-bar',
    totalsTotal: 'expenses-totals-bar-total',
    totalsRemains: 'expenses-totals-bar-remains',
    dayCard: (dayKey: string) => `expenses-day-${dayKey}`,
    dayCardWarned: (dayKey: string) => `expenses-day-${dayKey}-warned`,
    row: (i: number) => `expenses-row-${i}`,
    amountInput: 'expense-amount-input',
    labelInput: 'expense-label-input',
    dateInput: 'expense-date-input',
    dialog: 'add-expense-dialog',
  },
  dialog: {
    action: (dialog: string, label: 'save' | 'back' | 'delete') =>
      `${dialog}-action-${label}`,
  },
} as const;

/** yyyy-mm-dd for the runner's local today (matches app toDayKey). */
export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
