import type { Page } from '@playwright/test';
import { expect } from '../fixtures/test';

export type DialogIds = {
  dialog: string;
  amountInput: string;
  labelInput: string;
};

/**
 * Fill an add-item dialog (amount + label) and save.
 * Paper Dialogs stay mounted while open (no menu-style auto-dismiss),
 * so the plain locator API is deterministic here.
 */
export async function fillAndSave(
  page: Page,
  ids: DialogIds,
  opts: { amount: string; label: string },
): Promise<void> {
  await page.getByTestId(ids.amountInput).fill(opts.amount);
  await page.getByTestId(ids.labelInput).fill(opts.label);
  await page.getByTestId(`${ids.dialog}-action-save`).click();
  await page.getByTestId(ids.dialog).waitFor({ state: 'detached' });
}

/** Open the add dialog via FAB (list state) or empty-state action (first item). */
export async function openAddDialog(page: Page, triggerTestId: string, dialogTestId: string): Promise<void> {
  await page.getByTestId(triggerTestId).click();
  await page.getByTestId(dialogTestId).waitFor();
}

/**
 * Assert a totals bar is sticky: scroll the page hard, then the bar must
 * still intersect the viewport (a scrolled-away footer would not).
 */
export async function expectStickyBottom(page: Page, barTestId: string): Promise<void> {
  const bar = page.getByTestId(barTestId);
  await expect(bar).toBeVisible();
  await page.mouse.wheel(0, 3000);
  await page.waitForTimeout(300);
  const box = await bar.boundingBox();
  const viewport = page.viewportSize();
  expect(box, 'totals bar has layout box').not.toBeNull();
  expect(viewport, 'viewport size known').not.toBeNull();
  if (box && viewport) {
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 2);
    expect(box.y).toBeGreaterThanOrEqual(0);
  }
  await expect(bar).toBeVisible();
}
