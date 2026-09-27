import { test, expect } from '../fixtures/test';
import type { Page } from '@playwright/test';
import { tid, todayKey } from '../helpers/selectors';
import { gotoTab, setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

test.use({ viewport: { width: 390, height: 844 } });

/**
 * Visual suite — scripted screenshots against docs/redesign/*.jpg.
 * Shots land in test-results/visual/ (gitignored scratch); compare each
 * shot eyeball-to-mockup after the run. Element shots (not page shots):
 * the app scrolls inside a nested container that window scrolling
 * cannot reset.
 */
test.describe('visual', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  async function addIncome(page: Page, amount: string, label: string) {
    await gotoTab(page, 'income');
    const first = await page.getByTestId(tid.income.listCard).isVisible().catch(() => false);
    await openAddDialog(page, first ? tid.income.fab : tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount, label },
    );
  }

  test('V1: income matches income.jpg', async ({ page }) => {
    await addIncome(page, '25000', 'Salary');
    await openAddDialog(page, tid.income.fab, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '15000', label: 'Premium' },
    );
    await expect(page.getByTestId(tid.income.hero)).toBeVisible();
    await page.getByTestId(tid.income.hero).screenshot({ path: 'test-results/visual/01-income-hero.png' });
    await page.getByTestId(tid.income.listCard).screenshot({ path: 'test-results/visual/02-income-list.png' });
  });

  test('V2: income dialog matches income_add.jpg', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await page.getByTestId(tid.income.dialog).screenshot({ path: 'test-results/visual/03-income-dialog.png' });
  });

  test('V3: obligations match obligations.jpg', async ({ page }) => {
    await addIncome(page, '41600', 'Salary');
    await gotoTab(page, 'obligations');
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await page.getByTestId(tid.obligations.percentageSwitch).click();
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '50', label: 'savings' },
    );
    await openAddDialog(page, tid.obligations.fab, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '150', label: 'gas' },
    );
    await expect(page.getByTestId(tid.obligations.hero)).toBeVisible();
    await page.getByTestId(tid.obligations.hero).screenshot({ path: 'test-results/visual/04-obligations-hero.png' });
    await page.getByTestId(tid.obligations.listCard).screenshot({ path: 'test-results/visual/05-obligations-list.png' });
  });

  test('V4: obligation dialog', async ({ page }) => {
    await gotoTab(page, 'obligations');
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await page.getByTestId(tid.obligations.dialog).screenshot({ path: 'test-results/visual/06-obligation-dialog.png' });
  });

  test('V5: expenses match expenses.jpg', async ({ page }) => {
    await addIncome(page, '30000', 'Salary');
    await gotoTab(page, 'expenses');
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '10', label: 'coffee' },
    );
    await openAddDialog(page, tid.expenses.fab, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '5', label: 'transport' },
    );
    await expect(page.getByTestId(tid.expenses.hero)).toBeVisible();
    await page.getByTestId(tid.expenses.hero).screenshot({ path: 'test-results/visual/07-expenses-hero.png' });
    await page.getByTestId(tid.expenses.dayCard(todayKey())).screenshot({ path: 'test-results/visual/08-expenses-day.png' });
  });

  test('V6: expense dialog matches expenses.jpg modal', async ({ page }) => {
    await gotoTab(page, 'expenses');
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await page.getByTestId(tid.expenses.dialog).screenshot({ path: 'test-results/visual/09-expense-dialog.png' });
  });
});
