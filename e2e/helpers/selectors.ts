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
    totalsCard: 'income-totals-card',
    row: (i: number) => `income-row-${i}`,
    amountInput: 'income-amount-input',
    labelInput: 'income-label-input',
  },
  obligations: {
    empty: 'obligations-empty',
    emptyAction: 'obligations-empty-action',
    fab: 'obligations-fab',
    listCard: 'obligations-list-card',
    totalsCard: 'obligations-totals-card',
    row: (i: number) => `obligations-row-${i}`,
    amountInput: 'obligation-amount-input',
    labelInput: 'obligation-label-input',
    percentageSwitch: 'obligation-percentage-switch',
  },
  expenses: {
    empty: 'expenses-empty',
    emptyAction: 'expenses-empty-action',
    fab: 'expenses-fab',
    listCard: 'expenses-list-card',
    totalsCard: 'expenses-totals-card',
    row: (i: number) => `expenses-row-${i}`,
    amountInput: 'expense-amount-input',
    labelInput: 'expense-label-input',
  },
  dialog: {
    action: (dialog: string, label: 'save' | 'back') =>
      `${dialog}-action-${label}`,
  },
} as const;
