import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

/**
 * Obligation Tracking usecases (docs/design/usecases.md):
 *  B1 add fixed obligation
 *  B2 percentage obligation via obligation-percentage-switch
 *  B3 no timestamps shown on rows
 *  B4 daily + remaining recalculated
 */
test.describe('obligations', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
    await page.getByTestId(tid.tabs.obligations).click();
  });

  test('B1: add fixed obligation', async ({ page }) => {
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '1500', label: 'Rent' },
    );
    await expect(page.getByTestId(tid.obligations.row(0))).toContainText('Rent');
    await expect(page.getByTestId(tid.obligations.totalsTotal)).toContainText('1500');
  });

  test('B2: add percentage obligation', async ({ page }) => {
    // Seed total budget first: 10% of 10000 = 1000.
    await page.getByTestId(tid.tabs.income).click();
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '10000', label: 'Salary' },
    );
    await page.getByTestId(tid.tabs.obligations).click();
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await page.getByTestId(tid.obligations.percentageSwitch).click();
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '10', label: 'Tax' },
    );
    await expect(page.getByTestId(tid.obligations.row(0))).toContainText('10%');
    await expect(page.getByTestId(tid.obligations.totalsTotal)).toContainText('1000');
  });

  test('B3: rows show no timestamps', async ({ page }) => {
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '200', label: 'Internet' },
    );
    const rowText = await page.getByTestId(tid.obligations.row(0)).textContent();
    expect(rowText).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
  });

  test('B4: daily + remaining recalculated', async ({ page }) => {
    await page.getByTestId(tid.tabs.income).click();
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '31000', label: 'Salary' },
    );
    await page.getByTestId(tid.tabs.obligations).click();
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '1000', label: 'Rent' },
    );
    // Remaining 30000 over 30 days → daily 1000.
    await expect(page.getByTestId(tid.obligations.totalsRemaining)).toContainText('30000');
    await expect(page.getByTestId(tid.obligations.totalsDaily)).toContainText('1000');
  });
});
