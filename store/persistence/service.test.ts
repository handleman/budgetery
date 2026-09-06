import { PersistenceService } from './service';
import { MockStorageAdapter } from './mock-storage.adapter';
import { Store } from '../types';

function makeStore(overrides?: Partial<Store>): Store {
  return {
    incomeTutorialPassed: true,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
    welcomeTutorialPassed: true,
    currentPeriod: { name: 'October', month: 10 },
    incomeItems: [{ date: new Date('2026-10-01T00:00:00.000Z'), amount: 5000, label: 'Salary' }],
    obligationItems: [
      { date: new Date('2026-10-02T00:00:00.000Z'), amount: 1500, label: 'Rent', isPercentage: false },
    ],
    expenseItems: [{ date: new Date('2026-10-03T00:00:00.000Z'), amount: 50, label: 'Coffee' }],
    totalBudget: 5000,
    totalPercentageObligations: 0,
    totalObligations: 1500,
    totalExpenses: 50,
    remainingBudget: 3500,
    daylyBudget: 112.9,
    remains: 3450,
    ...overrides,
  };
}

describe('PersistenceService', () => {
  it('returns null when nothing is stored', async () => {
    const service = new PersistenceService(new MockStorageAdapter());
    await expect(service.load()).resolves.toBeNull();
    await expect(service.hasData()).resolves.toBe(false);
  });

  it('round-trips a full store without data loss', async () => {
    const service = new PersistenceService(new MockStorageAdapter());
    const store = makeStore();

    await service.save(store);
    const loaded = await service.load();

    expect(loaded).not.toBeNull();
    expect(loaded!.totalBudget).toBe(5000);
    expect(loaded!.totalObligations).toBe(1500);
    expect(loaded!.totalExpenses).toBe(50);
    expect(loaded!.remainingBudget).toBe(3500);
    expect(loaded!.daylyBudget).toBe(112.9);
    expect(loaded!.remains).toBe(3450);
    expect(loaded!.incomeTutorialPassed).toBe(true);
    expect(loaded!.welcomeTutorialPassed).toBe(true);
    expect(loaded!.currentPeriod).toEqual({ name: 'October', month: 10 });
    expect(loaded!.incomeItems).toHaveLength(1);
    expect(loaded!.incomeItems[0].date instanceof Date).toBe(true);
    expect(loaded!.incomeItems[0].amount).toBe(5000);
    expect(loaded!.obligationItems[0].isPercentage).toBe(false);
    expect(service.isValidStore(loaded)).toBe(true);
  });

  it('recovers the daily budget from legacy typo payloads', async () => {
    const adapter = new MockStorageAdapter();
    const service = new PersistenceService(adapter);

    // Simulate a blob written by the old buggy cleaner (dayilyBudget key,
    // no daylyBudget key) sitting on disk.
    (adapter as any).data.mockData = {
      ...makeStore(),
      daylyBudget: undefined,
      dayilyBudget: 42,
    };

    const loaded = await service.load();
    expect(loaded!.daylyBudget).toBe(42);
  });

  it('rejects invalid stores', () => {
    const service = new PersistenceService(new MockStorageAdapter());
    expect(service.isValidStore(null)).toBe(false);
    expect(service.isValidStore({})).toBe(false);
    expect(service.isValidStore({ currentPeriod: { name: 'x', month: 1 } })).toBe(false);
  });

  it('retries then throws when the adapter keeps failing', async () => {
    const failing = {
      load: async () => null,
      save: async () => {
        throw new Error('disk full');
      },
      clear: async () => undefined,
      transaction: async () => undefined,
    };
    const service = new PersistenceService(failing);

    await expect(service.save(makeStore())).rejects.toThrow('disk full');
  });

  it('clear removes persisted data', async () => {
    const service = new PersistenceService(new MockStorageAdapter());
    await service.save(makeStore());
    await expect(service.hasData()).resolves.toBe(true);
    await service.clear();
    await expect(service.hasData()).resolves.toBe(false);
  });
});
