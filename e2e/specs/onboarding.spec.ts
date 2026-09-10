import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';

/**
 * Tutorial Onboarding + period selection.
 * Usecases: first-run tutorial, month picker, period label, navigation to tabs.
 */
test.describe('onboarding', () => {
  test('O1: first run shows tutorial', async ({ page }) => {
    await expect(page.getByTestId(tid.welcome.getStarted)).toBeVisible();
  });

  test('O2: completing welcome reveals month picker', async ({ page }) => {
    await page.getByTestId(tid.welcome.getStarted).click();
    // NOTE: Paper Menu root does not render `month-picker` to the DOM;
    // the anchor (`month-picker-anchor`) is the stable visible handle.
    await expect(page.getByTestId(tid.welcome.monthPickerAnchor)).toBeVisible();
    await expect(page.getByTestId(tid.welcome.periodLabelInput)).toBeVisible();
    await expect(page.getByTestId(tid.welcome.apply)).toBeVisible();
  });

  // Unblocked 2026-09-10: the Paper Menu overlay auto-dismisses ~50–110ms
  // after opening headless, so multi-round-trip flows race it. Fixed with an
  // atomic in-page open+select (e2e/helpers/flows.ts selectMenuOption).
  test('O3: select month + label navigates to tabs', async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
    await expect(page.getByTestId(tid.tabs.income)).toBeVisible();
    await expect(page.getByTestId(tid.tabs.obligations)).toBeVisible();
    await expect(page.getByTestId(tid.tabs.expenses)).toBeVisible();
  });

  test('O4: new month (cleared storage) shows tutorial again', async ({
    page,
  }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.getByTestId(tid.welcome.getStarted)).toBeVisible();
  });
});
