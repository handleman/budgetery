import { test } from '../fixtures/test';

/**
 * Income Management usecases (docs/design/usecases.md):
 *  I1 add income via empty state, row + totals appear
 *  I2 second source, total = sum
 *  I3 totals sticky on scroll
 *  I4 daily + remaining budget shown
 *
 * Placeholder: dialog/menu web behavior against the static export
 * needs verification first (see E2E_PLAYWRIGHT_DESIGN.md §8).
 */
test.describe.skip('income', () => {
  test('I1: add income via empty state', async () => {});
  test('I2: second source sums into total', async () => {});
  test('I3: totals sticky on scroll', async () => {});
  test('I4: daily + remaining budget shown', async () => {});
});
