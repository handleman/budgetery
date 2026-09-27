import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';

/**
 * Web sidebar (redesign P5): visible at the default wide viewport
 * (1280px ≥ 1024px breakpoint), bottom tabs hidden, navigation works.
 */
test.describe('sidebar (wide)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('S1: sidebar visible, tab bar hidden', async ({ page }) => {
    await expect(page.getByTestId(tid.sidebar.rail)).toBeVisible();
    await expect(page.getByTestId(tid.tabs.income)).toBeHidden();
  });

  test('S2: sidebar navigates between tabs', async ({ page }) => {
    // Fresh period → tutorials unpassed → empty states (totals appear later).
    await page.getByTestId(tid.sidebar.nav('expenses')).click();
    await expect(
      page.getByTestId(tid.expenses.empty).or(page.getByTestId(tid.expenses.fab)),
    ).toBeVisible();
    await page.getByTestId(tid.sidebar.nav('obligations')).click();
    await expect(
      page.getByTestId(tid.obligations.empty).or(page.getByTestId(tid.obligations.listCard)),
    ).toBeVisible();
  });

  test('S3: sidebar Home and Settings leave tabs', async ({ page }) => {
    await page.getByTestId(tid.sidebar.nav('settings')).click();
    await expect(page.getByTestId(tid.config.status)).toBeVisible();
    // The sidebar lives in the tabs layout — go back, then go home.
    await page.goBack();
    await expect(page.getByTestId(tid.sidebar.rail)).toBeVisible();
    await page.getByTestId(tid.sidebar.nav('home')).click();
    await expect(page.getByTestId(tid.welcome.monthList)).toBeVisible();
  });
});
