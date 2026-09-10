import { test, expect } from '../fixtures/test';
import { tid } from '../helpers/selectors';
import { setupPeriod } from '../helpers/flows';
import { fillAndSave, openAddDialog } from '../helpers/dialogs';

/**
 * Cross-screen consistency / State Management usecases:
 *  C1 expense reduces remains identically on income/obligations/expenses screens
 *  C2 data persists across reload (AsyncStorage)
 */
test.describe('calculations', () => {
  test.beforeEach(async ({ page }) => {
    await setupPeriod(page, { month: 9, periodLabel: 'September' });
  });

  test('C1: remains agree across all screens', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '10000', label: 'Salary' },
    );
    await page.getByTestId(tid.tabs.obligations).click();
    await openAddDialog(page, tid.obligations.emptyAction, tid.obligations.dialog);
    await fillAndSave(
      page,
      { dialog: tid.obligations.dialog, amountInput: tid.obligations.amountInput, labelInput: tid.obligations.labelInput },
      { amount: '2000', label: 'Rent' },
    );
    await page.getByTestId(tid.tabs.expenses).click();
    await openAddDialog(page, tid.expenses.emptyAction, tid.expenses.dialog);
    await fillAndSave(
      page,
      { dialog: tid.expenses.dialog, amountInput: tid.expenses.amountInput, labelInput: tid.expenses.labelInput },
      { amount: '500', label: 'Food' },
    );

    // 10000 − 2000 − 500 = 7500 everywhere.
    await expect(page.getByTestId(tid.expenses.totalsRemains)).toContainText('7500');
    await page.getByTestId(tid.tabs.income).click();
    await expect(page.getByTestId(tid.income.totalsRemains)).toContainText('7500');
    await page.getByTestId(tid.tabs.obligations).click();
    await expect(page.getByTestId(tid.obligations.totalsRemains)).toContainText('7500');
  });

  test('C2: data persists across reload', async ({ page }) => {
    await openAddDialog(page, tid.income.emptyAction, tid.income.dialog);
    await fillAndSave(
      page,
      { dialog: tid.income.dialog, amountInput: tid.income.amountInput, labelInput: tid.income.labelInput },
      { amount: '8000', label: 'Salary' },
    );
    // Persistence saves asynchronously after the mutation — only reload
    // once the store has landed in IndexedDB (web adapter), otherwise the
    // reload races the write and drops the item.
    await page.waitForFunction(
      ({ dbName, storeName, needle }: { dbName: string; storeName: string; needle: string }) =>
        new Promise<boolean>((resolve) => {
          try {
            const open = indexedDB.open(dbName, 1);
            open.onerror = () => resolve(false);
            open.onsuccess = () => {
              try {
                const tx = open.result.transaction([storeName], 'readonly');
                const req = tx.objectStore(storeName).getAll();
                req.onsuccess = () => {
                  open.result.close();
                  resolve(JSON.stringify(req.result ?? '').includes(needle));
                };
                req.onerror = () => {
                  open.result.close();
                  resolve(false);
                };
              } catch {
                resolve(false);
              }
            };
          } catch {
            resolve(false);
          }
        }),
      { dbName: 'Budgetery', storeName: 'budget_store', needle: 'Salary' },
      { polling: 250, timeout: 10000 },
    );
    await page.reload();
    await page.getByTestId(tid.tabs.income).click();
    await expect(page.getByTestId(tid.income.row(0))).toContainText('Salary');
    await expect(page.getByTestId(tid.income.totalsTotal)).toContainText('8000');
  });
});
