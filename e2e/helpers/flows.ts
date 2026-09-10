import type { Page } from '@playwright/test';
import { tid } from './selectors';

/**
 * Atomically open a Paper Menu and click an option inside the page.
 *
 * Why: the menu overlay auto-dismisses ~50–110ms after opening under
 * headless Chromium, so any multi-round-trip flow (waitFor → click) races
 * the dismiss and flakes. Opening + selecting in a single evaluate task
 * clicks the real anchor and real option elements (same handlers as a
 * user tap) within ~10ms — deterministic across runs.
 */
export async function selectMenuOption(page: Page, anchorTestId: string, optionTestId: string): Promise<void> {
  const clicked = await page.getByTestId(anchorTestId).evaluate(
    (anchor, optionId) =>
      new Promise<string>((resolve) => {
        (anchor as HTMLElement).click();
        const t0 = Date.now();
        const tick = () => {
          const opt = document.querySelector(`[data-testid="${optionId}"]`);
          if (opt) {
            (opt as HTMLElement).click();
            resolve('clicked');
            return;
          }
          if (Date.now() - t0 > 5000) {
            resolve('TIMEOUT');
            return;
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    optionTestId,
  );
  if (clicked !== 'clicked') {
    throw new Error(`selectMenuOption: option ${optionTestId} never attached`);
  }
}

/** Dismiss the first-run tutorial: welcome screen -> month/period selection. */
export async function completeWelcome(
  page: Page,
  opts: { month?: number; periodLabel?: string } = {},
) {
  await page.getByTestId(tid.welcome.getStarted).click();
  if (opts.month !== undefined) {
    await selectMenuOption(page, tid.welcome.monthPickerAnchor, tid.welcome.monthOption(opts.month));
    await page.getByTestId(tid.welcome.monthPickerAnchor).getByText(monthLabel(opts.month)).waitFor();
  }
  if (opts.periodLabel !== undefined) {
    await page.getByTestId(tid.welcome.periodLabelInput).fill(opts.periodLabel);
  }
}

const MONTH_LABELS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function monthLabel(month: number): string {
  return MONTH_LABELS[month] ?? '';
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
