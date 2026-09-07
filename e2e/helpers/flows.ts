import type { Page } from '@playwright/test';
import { tid } from './selectors';

/** Dismiss the first-run tutorial: welcome screen -> month/period selection. */
export async function completeWelcome(
  page: Page,
  opts: { month?: number; periodLabel?: string } = {},
) {
  await page.getByTestId(tid.welcome.getStarted).click();
  if (opts.month !== undefined) {
    await page.getByTestId(tid.welcome.monthPickerAnchor).click();
    // Paper Menu entrance animation can restart indefinitely under headless
    // Chromium (measure -> setState -> re-show loop), so the option never
    // reports "stable" and a normal click times out. The option is laid out
    // and hit-testable throughout, so force the click at its current position.
    const option = page.getByTestId(tid.welcome.monthOption(opts.month));
    await option.waitFor({ state: 'attached' });
    await option.click({ force: true });
  }
  if (opts.periodLabel !== undefined) {
    await page.getByTestId(tid.welcome.periodLabelInput).fill(opts.periodLabel);
  }
}

/** Land on /tabs with a period applied (requires month picked first). */
export async function enterTabs(page: Page) {
  await page.getByTestId(tid.welcome.apply).click();
  await page.getByTestId(tid.tabs.income).waitFor();
}

/** Full setup: welcome -> pick month -> tabs. */
export async function setupPeriod(
  page: Page,
  opts: { month?: number; periodLabel?: string } = {},
) {
  await completeWelcome(page, opts);
  await enterTabs(page);
}
