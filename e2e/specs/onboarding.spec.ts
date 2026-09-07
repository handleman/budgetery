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

  // SKIP (2026-09-07): month-picker flow is implemented and verified manually
  // (select -> label autofill -> Apply -> /tabs), but the Paper Menu overlay
  // cannot be driven reliably by the headless runner yet: it auto-closes
  // ~100ms after opening and its entrance animation never reports "stable",
  // so the option click times out. Re-enable once the overlay is
  // automation-ready. See docs/design/E2E_PLAYWRIGHT_DESIGN.md §8.
  test.skip('O3: select month + label navigates to tabs', async ({ page }) => {
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
