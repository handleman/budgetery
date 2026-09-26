import { test, expect } from '@playwright/test';
import { tid } from '../helpers/selectors';

/**
 * Login gate usecases (docs/design/usecases.md, Login & Data Protection).
 * Uses the BASE Playwright test (no `budgetery.e2e.auth` seam) to cover
 * the locked path. Real Google OAuth is never completed in CI — the
 * suite asserts the gate redirects and the login UI renders.
 */
test.describe('login gate', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('L1: logged-out visitor is sent to /login', async ({ page }) => {
    await expect(page.getByTestId(tid.login.title)).toContainText('Login to Budgetery');
    expect(page.url()).toContain('/login');
  });

  test('L2: login screen offers Google connect', async ({ page }) => {
    await expect(page.getByTestId(tid.login.info)).toContainText('Google Drive');
    await expect(page.getByTestId(tid.login.connect)).toBeVisible();
  });

  test('L3: deep links are gated too', async ({ page }) => {
    await page.goto('/tabs/expenses');
    await expect(page.getByTestId(tid.login.title)).toBeVisible();
    expect(page.url()).toContain('/login');
  });
});
