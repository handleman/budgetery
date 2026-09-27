import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';

test.use({ viewport: { width: 390, height: 844 } });

/**
 * Narrow viewport (< 1024px): sidebar hidden, bottom tab bar shown.
 */
test.describe('sidebar (narrow)', () => {
  test('S4: tab bar visible, sidebar hidden', async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
    await expect(page.getByTestId(tid.tabs.income)).toBeVisible();
    await expect(page.getByTestId(tid.sidebar.rail)).toBeHidden();
  });
});
