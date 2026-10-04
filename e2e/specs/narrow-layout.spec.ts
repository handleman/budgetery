import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { gotoTab, setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

/**
 * Narrow-layout lists go edge-to-edge: the list cards cancel the screen's
 * horizontal padding while headers/hero keep their inset.
 */
test.describe('narrow full-bleed lists', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('income list is screen-wide, hero stays inset', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '1000', label: 'Salary' },
    );
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');

    const cardBox = await page.getByTestId(tid.income.listCard).boundingBox();
    expect(cardBox, 'income list card has layout box').not.toBeNull();
    expect(cardBox!.x).toBeLessThanOrEqual(1);
    expect(cardBox!.width).toBeGreaterThanOrEqual(388);

    const heroBox = await page.getByTestId(tid.income.hero).boundingBox();
    expect(heroBox, 'income hero has layout box').not.toBeNull();
    expect(heroBox!.x).toBeGreaterThanOrEqual(24);
  });

  test('obligations list is screen-wide', async ({ page }) => {
    await gotoTab(page, 'obligations');
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '1500', label: 'Rent' },
    );
    await expect(page.getByTestId(tid.obligations.row(0))).toContainText('Rent');

    const cardBox = await page.getByTestId(tid.obligations.listCard).boundingBox();
    expect(cardBox, 'obligations list card has layout box').not.toBeNull();
    expect(cardBox!.x).toBeLessThanOrEqual(1);
    expect(cardBox!.width).toBeGreaterThanOrEqual(388);
  });
});
