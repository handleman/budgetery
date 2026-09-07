import { test } from '../fixtures/test';

/**
 * Expense Tracking usecases (docs/design/usecases.md):
 *  E1 add expense, total + remains updated
 *  E2 grouped by day, expandable card
 *  E3 over-budget day highlighted until overlap passes
 *  E4 totals sticky at bottom
 *
 * Placeholder: see E2E_PLAYWRIGHT_DESIGN.md §8.
 */
test.describe.skip('expenses', () => {
  test('E1: add expense updates total + remains', async () => {});
  test('E2: expenses grouped by day', async () => {});
  test('E3: over-budget day highlighted', async () => {});
  test('E4: totals sticky at bottom', async () => {});
});
