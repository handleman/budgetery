import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';

/**
 * Bottom navbar navigation: income / obligations / expenses.
 * Usecase: "navigate between screens by bottom bar".
 *
 * Unblocked together with O3 (atomic menu select in e2e/helpers/flows.ts).
 */
test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('N1: all three tabs are visible', async ({ page }) => {
    await expect(page.getByTestId(tid.tabs.income)).toBeVisible();
    await expect(page.getByTestId(tid.tabs.obligations)).toBeVisible();
    await expect(page.getByTestId(tid.tabs.expenses)).toBeVisible();
  });

  test('N2: switching tabs shows each screen', async ({ page }) => {
    await page.getByTestId(tid.tabs.obligations).click();
    await expect(
      page.getByTestId(tid.obligations.empty).or(
        page.getByTestId(tid.obligations.listCard),
      ),
    ).toBeVisible();

    await page.getByTestId(tid.tabs.expenses).click();
    await expect(
      page.getByTestId(tid.expenses.empty).or(
        page.getByTestId(tid.expenses.fab),
      ),
    ).toBeVisible();

    await page.getByTestId(tid.tabs.income).click();
    await expect(
      page.getByTestId(tid.income.empty).or(
        page.getByTestId(tid.income.listCard),
      ),
    ).toBeVisible();
  });
});
