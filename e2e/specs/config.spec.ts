import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';

/**
 * Configuration screen (docs/design/GOOGLE_DRIVE_SYNC_DESIGN.md M1).
 * Runs seam-authenticated (gate bypass) but logged-out: status shows
 * "Not connected", the Drive folder card shows the fixed default folder.
 * Real Google OAuth / Drive calls are never touched in CI.
 */
test.describe('config', () => {
  test('F1: config shows status + default Drive folder', async ({ page }) => {
    await page.getByTestId(tid.welcome.config).click();
    await expect(page.getByTestId(tid.config.status)).toContainText('Not connected');
    await expect(page.getByTestId(tid.config.driveFolder)).toContainText('Budgetery (default)');
  });
});
