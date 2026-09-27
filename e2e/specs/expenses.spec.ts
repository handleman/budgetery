import { test, expect } from '../fixtures/test';
import { tid, todayKey } from '../helpers/selectors';
import { gotoTab, setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog, expectStickyBottom } from '../helpers/dialogs';

/**
 * Expense Tracking usecases (docs/design/usecases.md):
 *  E1 add expense, total + remains updated
 *  E2 grouped by day, expandable card
 *  E3 over-budget day highlighted until overlap passes
 *  E4 totals sticky at bottom
 *  E5 day-by-day breakdown table shows spent per day
 */
test.describe('expenses', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
    // Seed budget so remains/daily are meaningful.
    await gotoTab(page, 'income');
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '30000', label: 'Salary' },
    );
    await gotoTab(page, 'expenses');
  });

  test('E1: add expense updates total + remains', async ({ page }) => {
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '500', label: 'Groceries' },
    );
    await expect(page.getByTestId(tid.expenses.row(0))).toContainText('Groceries');
    await expect(page.getByTestId(tid.expenses.totalsTotal)).toContainText('500');
    await expect(page.getByTestId(tid.expenses.totalsRemains)).toContainText('29500');
  });

  test('E2: expenses grouped by day', async ({ page }) => {
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '100', label: 'Coffee' },
    );
    await openAddDialog(page, tid.expenses.fab, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '200', label: 'Lunch' },
    );
    const dayCard = page.getByTestId(tid.expenses.dayCard(todayKey()));
    await expect(dayCard).toBeVisible();
    await expect(dayCard).toContainText('Coffee');
    await expect(dayCard).toContainText('Lunch');
    await expect(dayCard).toContainText('300');
  });

  test('E3: over-budget day highlighted', async ({ page }) => {
    // Daily = 30000/30 = 1000; a 5000 expense overshoots → warned card.
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '5000', label: 'Big purchase' },
    );
    await expect(page.getByTestId(tid.expenses.dayCardWarned(todayKey()))).toBeVisible();
  });

  test('E4: totals sticky at bottom', async ({ page }) => {
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '500', label: 'Groceries' },
    );
    if (await page.getByTestId(tid.sidebar.rail).isVisible().catch(() => false)) {
      // Wide: totals live in the side card, always visible (no scroll).
      await expect(page.getByTestId(tid.expenses.totalsBar)).toBeVisible();
    } else {
      await expectStickyBottom(page, tid.expenses.totalsBar);
    }
  });

  test('E5: day-by-day breakdown shows spent per day', async ({ page }) => {
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '500', label: 'Groceries' },
    );
    await expect(page.getByTestId(tid.expenses.dayTable)).toBeVisible();
    // Daily = 30000/30 = 1000; spent 500 leaves 500 on today's row.
    await expect(page.getByTestId(tid.expenses.dayTableRow(todayKey()))).toContainText('500');
  });
});
