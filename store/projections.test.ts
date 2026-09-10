import { appReducer } from './reducer';
import { projectIncome } from './projections';
import { ACTION_TYPES } from './enums';
import { CurrentPeriod, IncomeItem, Store } from './types';

function baseStore(): Store {
  return {
    incomeTutorialPassed: true,
    obligationsTutorialPassed: true,
    expensesTutorialPassed: true,
    welcomeTutorialPassed: true,
    currentPeriod: { name: '', month: 0 },
    periods: [],
    currentPeriodId: null,
    incomeItems: [],
    obligationItems: [],
    expenseItems: [],
    totalBudget: 0,
    totalPercentageObligations: 0,
    totalObligations: 0,
    totalExpenses: 0,
    remainingBudget: 0,
    daylyBudget: 0,
    remains: 0,
  };
}

describe('projectIncome', () => {
  it('returns empty without period history', () => {
    expect(projectIncome(baseStore())).toEqual([]);
  });

  it('projects prior-period labels with avg amount and modal day, skipping current-month labels', () => {
    const october = appReducer(baseStore(), {
      type: ACTION_TYPES.START_NEW_MONTH,
      payload: { name: 'October', month: 10 } as CurrentPeriod,
    } as any);
    const withSalary = appReducer(october, {
      type: ACTION_TYPES.ADD_INCOME,
      payload: { date: new Date(2026, 9, 5), amount: 3000, label: 'Salary' } as IncomeItem,
    } as any);
    const withBonus = appReducer(withSalary, {
      type: ACTION_TYPES.ADD_INCOME,
      payload: { date: new Date(2026, 9, 6), amount: 500, label: 'Bonus' } as IncomeItem,
    } as any);
    const november = appReducer(withBonus, {
      type: ACTION_TYPES.START_NEW_MONTH,
      payload: { name: 'November', month: 11 } as CurrentPeriod,
    } as any);

    const projections = projectIncome(november);
    expect(projections.length).toBe(2);
    const salary = projections.find((p) => p.label === 'Salary')!;
    expect(salary.avgAmount).toBe(3000);
    expect(salary.modalDay).toBe(5);

    // Entering salary this month removes it from projections.
    const withCurrent = appReducer(november, {
      type: ACTION_TYPES.ADD_INCOME,
      payload: { date: new Date(), amount: 3100, label: 'Salary' } as IncomeItem,
    } as any);
    expect(projectIncome(withCurrent).map((p) => p.label)).toEqual(['Bonus']);
  });
});
