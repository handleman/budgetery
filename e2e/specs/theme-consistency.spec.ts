import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { gotoTab, setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

/**
 * Theme consistency (iOS Safari black-background report):
 * on web the Paper theme (RootLayout) and the RN appearance-driven views
 * (ThemedView/Text, canvas) must resolve to the SAME color scheme.
 * A previous `hooks/useColorScheme.web.ts` override pinned Paper to light
 * while the OS reported dark → light card frames/tab bar/totals around
 * black list interiors with invisible text.
 *
 * These specs pin both theme sources in each scheme via computed styles:
 * surfaces must follow the scheme, text must contrast its container.
 */
type RGB = { r: number; g: number; b: number };

function parseRGB(css: string): RGB | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) === 0) return null; // transparent
  return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
}

const isDarkSurface = (c: RGB) => c.r <= 90 && c.g <= 90 && c.b <= 90;
const isLightSurface = (c: RGB) => c.r >= 150 && c.g >= 150 && c.b >= 150;

async function bgOf(page: Page, testId: string): Promise<RGB | null> {
  const css = await page.evaluate((id: string) => {
    const el = document.querySelector(`[data-testid="${id}"]`);
    return el ? getComputedStyle(el).getPropertyValue('background-color') : '';
  }, testId);
  return parseRGB(css);
}

/** Computed `color` of the leaf element rendering `needle` inside a testID root. */
async function textFg(page: Page, containerTestId: string, needle: string): Promise<RGB | null> {
  const css = await page.evaluate(
    ({ id, text }: { id: string; text: string }) => {
      const root = document.querySelector(`[data-testid="${id}"]`);
      if (!root) return '';
      const leaves = [...root.querySelectorAll('*')].filter(
        (n) => n.children.length === 0 && (n.textContent ?? '').includes(text),
      );
      const target = leaves[0] ?? null;
      return target ? getComputedStyle(target).getPropertyValue('color') : '';
    },
    { id: containerTestId, text: needle },
  );
  return parseRGB(css);
}

test.describe('theme consistency, dark scheme (narrow)', () => {
  test.use({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('empty states are dark with readable text', async ({ page }) => {
    await gotoTab(page, 'expenses');
    await expect(page.getByTestId(tid.expenses.empty)).toBeVisible();

    const containerBg = await bgOf(page, tid.expenses.empty);
    expect(containerBg, 'expenses empty container has opaque bg').not.toBeNull();
    expect(isDarkSurface(containerBg!), 'expenses empty container follows dark scheme').toBe(true);

    const titleFg = await textFg(page, tid.expenses.empty, 'Daily expenses');
    expect(titleFg, 'expenses empty title has opaque color').not.toBeNull();
    expect(isLightSurface(titleFg!), 'expenses empty title readable on dark container').toBe(true);
  });

  test('filled income list matches dark chrome', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '1978', label: 'Salary' },
    );
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');

    // RN-sourced row wrapper must be dark (was: black rows inside a light card).
    const rowWrapperBg = await page
      .getByTestId(tid.income.row(0))
      .evaluate((el) => {
        const p = el.parentElement;
        return p ? getComputedStyle(p).getPropertyValue('background-color') : '';
      })
      .then(parseRGB);
    expect(rowWrapperBg, 'income row wrapper has opaque bg').not.toBeNull();
    expect(isDarkSurface(rowWrapperBg!), 'income row wrapper follows dark scheme').toBe(true);

    // Paper-sourced row title must be light (was: invisible dark-on-dark).
    const rowFg = await textFg(page, tid.income.row(0), 'Salary');
    expect(rowFg, 'income row title has opaque color').not.toBeNull();
    expect(isLightSurface(rowFg!), 'income row title readable on dark card').toBe(true);

    // Paper-sourced totals bar must be dark (was: light strip).
    const totalsBg = await bgOf(page, tid.income.totalsBar);
    expect(totalsBg, 'income totals bar has opaque bg').not.toBeNull();
    expect(isDarkSurface(totalsBg!), 'income totals bar follows dark scheme').toBe(true);

    const totalsFg = await textFg(page, tid.income.totalsTotal, '1978');
    expect(totalsFg, 'income totals value has opaque color').not.toBeNull();
    expect(isLightSurface(totalsFg!), 'income totals value readable on dark bar').toBe(true);

    // Paper tab bar active tint must be the dark-scheme tint (was: light teal).
    const tabFg = await textFg(page, tid.tabs.income, 'Income');
    expect(tabFg, 'income tab label has opaque color').not.toBeNull();
    expect(isLightSurface(tabFg!), 'active tab follows dark-scheme tint').toBe(true);
  });

  test('filled obligations list is readable', async ({ page }) => {
    await gotoTab(page, 'obligations');
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '1500', label: 'Rent' },
    );
    await expect(page.getByTestId(tid.obligations.row(0))).toContainText('Rent');

    const rowFg = await textFg(page, tid.obligations.row(0), 'Rent');
    expect(rowFg, 'obligation row title has opaque color').not.toBeNull();
    expect(isLightSurface(rowFg!), 'obligation row title readable on dark card').toBe(true);

    const totalsBg = await bgOf(page, tid.obligations.totalsBar);
    expect(totalsBg, 'obligations totals bar has opaque bg').not.toBeNull();
    expect(isDarkSurface(totalsBg!), 'obligations totals bar follows dark scheme').toBe(true);
  });
});

test.describe('theme consistency, light scheme (narrow)', () => {
  test.use({ colorScheme: 'light', viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('sources agree on light', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '1978', label: 'Salary' },
    );
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');

    const totalsBg = await bgOf(page, tid.income.totalsBar);
    expect(totalsBg, 'income totals bar has opaque bg').not.toBeNull();
    expect(isLightSurface(totalsBg!), 'income totals bar follows light scheme').toBe(true);

    const totalsFg = await textFg(page, tid.income.totalsTotal, '1978');
    expect(totalsFg, 'income totals value has opaque color').not.toBeNull();
    expect(isDarkSurface(totalsFg!), 'income totals value readable on light bar').toBe(true);
  });
});
