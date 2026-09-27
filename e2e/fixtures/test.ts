import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Wait until the web export finishes boot (font load, splash hide, store
 * rehydration) by observing DOM quiescence: no mutations for `quietMs`.
 *
 * Why: Paper Menu/Modal overlays opened within ~1s of page load are torn down
 * by a late boot commit (menu auto-closes ~50ms after opening with no input).
 * After boot settles, overlays are stable. See docs/design/E2E_PLAYWRIGHT_DESIGN.md.
 */
export async function waitForBoot(
  page: Page,
  opts: { quietMs?: number; timeout?: number } = {},
) {
  const { quietMs = 500, timeout = 10000 } = opts;
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    ({ quietMs, timeout }: { quietMs: number; timeout: number }) =>
      new Promise<void>((resolve, reject) => {
        const t0 = Date.now();
        let timer: ReturnType<typeof setTimeout>;
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          arm();
        });
        const arm = () => {
          timer = setTimeout(() => {
            observer.disconnect();
            resolve();
          }, quietMs);
        };
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });
        arm();
        setTimeout(() => {
          observer.disconnect();
          if (Date.now() - t0 >= timeout)
            reject(new Error('waitForBoot timed out'));
          else resolve();
        }, timeout);
      }),
    { quietMs, timeout },
  );
}

/**
 * Isolated E2E test fixture.
 * The store persists via AsyncStorage -> localStorage on web,
 * so every test starts from a clean slate: goto('/'), clear storage,
 * reload, then wait for boot to settle before interacting.
 */
export const test = base.extend<object>({
  page: async ({ page }, use) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitForBoot(page);
    await use(page);
  },
});

export { expect };
