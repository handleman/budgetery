import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

/**
 * Hero "+" / FAB handoff (narrow layout):
 * the hero "+" opens the add dialog directly, and the in-flow FAB
 * appears only after the hero scrolls out of view.
 */
test.describe('hero/fab handoff (narrow)', () => {
  test.use({ viewport: { width: 390, height: 500 } });

  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('hero + opens dialog; FAB hidden until hero scrolls out', async ({ page }) => {
    // First item via the empty state.
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '1000', label: 'Salary' },
    );
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');

    // Hero "+" opens the dialog directly (no scroll workaround).
    await page.getByTestId(tid.income.heroAdd).click();
    await expect(page.getByTestId(tid.income.dialog)).toBeVisible();
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '200', label: 'Bonus' },
    );

    // Grow the list so the page scrolls (short viewport).
    for (const [amount, label] of [['300', 'Gift'], ['400', 'Cashback'], ['500', 'Refund']] as const) {
      await page.getByTestId(tid.income.heroAdd).click();
      await fillAndSave(
        page,
        { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
        { amount, label },
      );
    }

    // Hero visible at top → no FAB.
    await expect(page.getByTestId(tid.income.fab)).toBeHidden();

    // Scroll the hero out of view → FAB appears and opens the dialog.
    // (Wheel over the scroll container; at the default cursor spot the
    // nested scroller would not receive it.)
    await page.mouse.move(195, 250);
    await page.mouse.wheel(0, 2000);
    await expect(page.getByTestId(tid.income.fab)).toBeVisible({ timeout: 5000 });
    await page.getByTestId(tid.income.fab).click();
    await expect(page.getByTestId(tid.income.dialog)).toBeVisible();
  });
});
