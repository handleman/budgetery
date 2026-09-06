import { IndexedDBAdapter } from './indexed-db.adapter';
import { Store } from '../types';

/**
 * Minimal in-memory fake of the IndexedDB surface used by
 * IndexedDBAdapter (open / transaction / put / getAll / clear).
 *
 * It mirrors one browser rule the real bug violated: on a store with
 * `keyPath: 'id'`, putting a record whose `id` is null/undefined fails
 * with a DataError instead of auto-generating a key.
 */
class FakeIDBRequest {
  onsuccess: ((event?: any) => void) | null = null;
  onerror: ((event?: any) => void) | null = null;
  onupgradeneeded: ((event?: any) => void) | null = null;
  result: any = undefined;
  error: any = undefined;
}

class FakeObjectStore {
  private rows = new Map<number, any>();

  put(record: any): FakeIDBRequest {
    const request = new FakeIDBRequest();
    queueMicrotask(() => {
      const key = record?.id;
      if (typeof key !== 'number') {
        request.error = new DOMException(
          "Failed to execute 'put' on 'IDBObjectStore': Evaluating the object store's key path yielded a value that is not a valid key.",
          'DataError',
        );
        request.onerror?.({ target: request });
        return;
      }
      this.rows.set(key, record);
      request.result = key;
      request.onsuccess?.({ target: request });
    });
    return request as any;
  }

  getAll(): FakeIDBRequest {
    const request = new FakeIDBRequest();
    queueMicrotask(() => {
      request.result = [...this.rows.values()];
      request.onsuccess?.({ target: request });
    });
    return request as any;
  }

  clear(): FakeIDBRequest {
    const request = new FakeIDBRequest();
    queueMicrotask(() => {
      this.rows.clear();
      request.onsuccess?.({ target: request });
    });
    return request as any;
  }

  createIndex(): void {}

  get size(): number {
    return this.rows.size;
  }
}

class FakeDatabase {
  objectStoreNames = { contains: (name: string) => this.stores.has(name) };
  private stores = new Map<string, FakeObjectStore>();

  createObjectStore(name: string): FakeObjectStore {
    const store = new FakeObjectStore();
    this.stores.set(name, store);
    return store;
  }

  transaction(_names: string[], _mode: string) {
    return {
      objectStore: (name: string) => this.stores.get(name)!,
    };
  }

  storeForTest(name: string): FakeObjectStore | undefined {
    return this.stores.get(name);
  }
}

function installFakeIndexedDB() {
  const databases = new Map<string, { version: number; db: FakeDatabase }>();
  const fake = {
    open: (name: string, version: number) => {
      const request = new FakeIDBRequest();
      queueMicrotask(() => {
        let entry = databases.get(name);
        if (!entry || entry.version !== version) {
          entry = { version, db: entry?.db ?? new FakeDatabase() };
          databases.set(name, entry);
          request.result = entry.db;
          request.onupgradeneeded?.({ target: request });
        }
        request.result = entry.db;
        request.onsuccess?.({ target: request });
      });
      return request;
    },
  };
  (globalThis as any).indexedDB = fake;
  return databases;
}

function makeStore(): Store {
  return {
    incomeTutorialPassed: true,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
    welcomeTutorialPassed: true,
    currentPeriod: { name: 'September', month: 9 },
    incomeItems: [{ date: new Date('2026-09-01T00:00:00.000Z'), amount: 5000, label: 'Salary' }],
    obligationItems: [],
    expenseItems: [],
    totalBudget: 5000,
    totalPercentageObligations: 0,
    totalObligations: 0,
    totalExpenses: 0,
    remainingBudget: 5000,
    daylyBudget: 166.67,
    remains: 5000,
  };
}

describe('IndexedDBAdapter', () => {
  let databases: Map<string, { version: number; db: FakeDatabase }>;

  beforeEach(() => {
    databases = installFakeIndexedDB();
  });

  afterEach(() => {
    delete (globalThis as any).indexedDB;
  });

  it('saves with a valid numeric key and round-trips the store', async () => {
    const adapter = new IndexedDBAdapter();

    await adapter.save(makeStore());
    const loaded = await adapter.load();

    expect(loaded).not.toBeNull();
    expect(loaded!.totalBudget).toBe(5000);
    expect(loaded!.currentPeriod).toEqual({ name: 'September', month: 9 });
    expect(loaded!.incomeItems).toHaveLength(1);
    expect(loaded!.incomeItems[0].date instanceof Date).toBe(true);
    expect(loaded!.incomeItems[0].label).toBe('Salary');
  });

  it('overwrites the same row on repeat saves instead of appending', async () => {
    const adapter = new IndexedDBAdapter();

    await adapter.save(makeStore());
    await adapter.save({ ...makeStore(), totalBudget: 6000 });

    const db = databases.get('Budgetery')!.db;
    expect(db.storeForTest('budget_store')!.size).toBe(1);

    const loaded = await adapter.load();
    expect(loaded!.totalBudget).toBe(6000);
  });

  it('clear removes the persisted row', async () => {
    const adapter = new IndexedDBAdapter();

    await adapter.save(makeStore());
    await adapter.clear();

    await expect(adapter.load()).resolves.toBeNull();
  });
});
