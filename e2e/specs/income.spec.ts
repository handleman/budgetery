import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog, expectStickyBottom } from '../helpers/dialogs';

/**
 * Income Management usecases (docs/design/usecases.md):
 *  I1 add income via empty state, row + totals appear
 *  I2 second source, total = sum
 *  I3 totals sticky on scroll
 *  I4 daily + remaining budget shown
 */
test.describe('income', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('I1: add income via empty state', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '5000', label: 'Salary' },
    );
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');
    await expect(page.getByTestId(tid.income.totalsTotal)).toContainText('5000');
  });

  test('I2: second source sums into total', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '5000', label: 'Salary' },
    );
    await openAddDialog(page, tid.income.fab, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '1000', label: 'Freelance' },
    );
    await expect(page.getByTestId(tid.income.row(1))).toContainText('Freelance');
    await expect(page.getByTestId(tid.income.totalsTotal)).toContainText('6000');
  });

  test('I3: totals sticky on scroll', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '5000', label: 'Salary' },
    );
    await expectStickyBottom(page, tid.income.totalsBar);
  });

  test('I4: daily + remaining budget shown', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '30000', label: 'Salary' },
    );
    // September: 30 days → daily 1000, remaining = total (no obligations).
    await expect(page.getByTestId(tid.income.totalsDaily)).toContainText('1000');
    await expect(page.getByTestId(tid.income.totalsRemaining)).toContainText('30000');
  });
});
