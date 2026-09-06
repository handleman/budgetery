import { IStorageAdapter } from './types';
import { StorageRegistry } from './storage-registry';
import { Store } from '../types';
import { applyMigrations } from '../migrations';

export interface IPersistenceManager {
    initialize(): Promise<void>;
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    hasData(): Promise<boolean>;
}

const MAX_SAVE_ATTEMPTS = 3;

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class PersistenceService implements IPersistenceManager {
    private static instance: PersistenceService;

    public static getInstance(): PersistenceService {
        if (!PersistenceService.instance) {
            PersistenceService.instance = new PersistenceService();
        }
        return PersistenceService.instance;
    }

    private isInitialized = false;
    private storage: IStorageAdapter | null = null;

    /**
     * @param storage Optional adapter to use directly (used by tests to
     * inject a mock). When omitted, the adapter is resolved via
     * StorageRegistry during initialize().
     */
    constructor(storage?: IStorageAdapter) {
        if (storage) {
            this.storage = storage;
        }
    }

    /**
     * Initialize persistence (call once at app startup)
     */
    public async initialize(): Promise<void> {
        // Idempotency - if already initialized, just resolve
        if (this.isInitialized && this.storage) {
            return;
        }

        try {
            if (!this.storage) {
                // Get registry and initialize storage adapter
                const registry = StorageRegistry.getInstance();
                await registry.initialize();

                this.storage = registry.getAdapter() || null;
            }

            if (!this.storage) {
                console.warn('[PersistenceService] No storage adapter available');
                return;
            }

            // Initialize platform-specific setups (e.g., IndexedDB create)
            if (typeof this.storage.init === 'function') {
                await this.storage.init();
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('[PersistenceService] Failed to initialize:', error);

            // Graceful degradation - store can work without persistence
            // Mark as initialized for graceful fallback mode
            this.isInitialized = true;
        }
    }

    /**
     * Load persisted store from storage. Applies pending migrations and
     * normalizes missing fields so callers always get a complete Store.
     */
    public async load(): Promise<Store | null> {
        if (!this.storage) {
            return null;
        }

        try {
            const storedData: Store | null = await this.storage.load();

            if (!storedData) {
                return null;
            }

            const migrated = (await applyMigrations(storedData)) as Store;
            const restored = restoreDates(migrated);

            return normalizeStore(restored);
        } catch (error) {
            console.error('[PersistenceService] Failed to load persisted state:', error);

            // Return null on error - let app use default/initial data
            return null;
        }
    }

    /**
     * Persist store to disk, retrying with backoff on transient failures.
     */
    public async save(store: Store): Promise<void> {
        if (!this.storage) {
            console.warn('[PersistenceService] Storage not initialized');
            return;
        }

        // Clean the store for storage (convert Dates, numbers, etc.)
        const storedData = cleanStoreForStorage(store);

        let lastError: unknown = null;
        for (let attempt = 1; attempt <= MAX_SAVE_ATTEMPTS; attempt++) {
            try {
                await this.storage.save(storedData);
                return;
            } catch (error) {
                lastError = error;
                console.error(`[PersistenceService] Save attempt ${attempt} failed:`, error);
                if (attempt < MAX_SAVE_ATTEMPTS) {
                    await delay(100 * 2 ** (attempt - 1));
                }
            }
        }

        throw lastError;
    }

    /**
     * Clear all persisted data
     */
    public async clear(): Promise<void> {
        if (!this.storage) {
            return;
        }

        try {
            await this.storage.clear();
        } catch (error) {
            console.error('[PersistenceService] Failed to clear storage:', error);
            throw error;
        }
    }

    /**
     * Check if any data is persisted
     */
    public async hasData(): Promise<boolean> {
        const store = await this.load();
        return !!store && Object.keys(store).length > 0;
    }

    /**
     * Get current storage adapter (for advanced use cases)
     */
    public getStorageAdapter(): IStorageAdapter | null {
        return this.storage;
    }

    /**
     * Check if persistence is ready and initialized
     */
    public async isReady(): Promise<boolean> {
        if (!this.storage) {
            console.warn('[PersistenceService] Not yet initialized');
            await this.initialize();
        }

        return !!this.storage && this.isInitialized;
    }

    /**
     * Validation of loaded data before returning to UI. Tolerant of
     * missing derived fields (normalizeStore fills them in) but strict
     * about structural fields.
     */
    public isValidStore(store: any): store is Store {
        if (!store || typeof store !== 'object') return false;

        const isValidCurrentPeriod =
            !!store.currentPeriod &&
            typeof store.currentPeriod.name === 'string' &&
            typeof store.currentPeriod.month === 'number';

        const isValidItemsArray =
            Array.isArray(store.incomeItems) &&
            Array.isArray(store.obligationItems) &&
            Array.isArray(store.expenseItems);

        return isValidCurrentPeriod && isValidItemsArray;
    }
}

type SerializableItem = {
    date?: Date | string;
    amount: number;
    label: string;
    isPercentage?: boolean;
};

function cleanItems(items: unknown): Array<Record<string, unknown>> {
    if (!Array.isArray(items)) return [];
    return (items as SerializableItem[]).map((item) => ({
        date:
            item.date instanceof Date
                ? item.date.toISOString()
                : typeof item.date === 'string'
                  ? item.date
                  : '',
        amount: typeof item.amount === 'number' ? item.amount : 0,
        label: typeof item.label === 'string' ? item.label : '',
        isPercentage: item.isPercentage === true,
    }));
}

/**
 * Clean a store for JSON serialization (Date -> ISO string, etc.).
 * Preserves every Store field so round-trips are lossless.
 */
function cleanStoreForStorage(store: Store): Store {
    const record = store as unknown as Record<string, unknown>;
    const monthRaw = store.currentPeriod?.month;
    const month =
        typeof monthRaw === 'number'
            ? monthRaw
            : typeof monthRaw === 'string'
              ? Number(monthRaw) || 0
              : 0;

    const cleaned = {
        incomeTutorialPassed: store.incomeTutorialPassed === true,
        obligationsTutorialPassed: store.obligationsTutorialPassed === true,
        expensesTutorialPassed: store.expensesTutorialPassed === true,
        welcomeTutorialPassed: store.welcomeTutorialPassed === true,
        currentPeriod: {
            name: store.currentPeriod?.name || '',
            month,
        },
        incomeItems: cleanItems(record['incomeItems']),
        obligationItems: cleanItems(record['obligationItems']),
        expenseItems: cleanItems(record['expenseItems']),
        totalBudget: toNumber(record['totalBudget']),
        totalPercentageObligations: toNumber(record['totalPercentageObligations']),
        totalObligations: toNumber(record['totalObligations']),
        totalExpenses: toNumber(record['totalExpenses']),
        remainingBudget: toNumber(record['remainingBudget']),
        daylyBudget: toNumber(record['daylyBudget']),
        remains: toNumber(record['remains']),
    };

    return cleaned as unknown as Store;
}

function toNumber(value: unknown): number {
    return typeof value === 'number' && !isNaN(value) ? value : 0;
}

/**
 * Convert ISO date strings back to Date objects for the UI layer.
 */
function restoreDates(store: Store): Store {
    const restored = { ...(store as unknown as Record<string, unknown>) };

    (['incomeItems', 'obligationItems', 'expenseItems'] as const).forEach((key) => {
        const items = restored[key];
        if (Array.isArray(items)) {
            restored[key] = items.map((item: any) => {
                if (item && typeof item.date === 'string' && item.date) {
                    const parsed = new Date(item.date);
                    if (!isNaN(parsed.getTime())) {
                        return { ...item, date: parsed };
                    }
                }
                return item;
            });
        }
    });

    return restored as unknown as Store;
}

/**
 * Fill in missing fields with defaults so older/incomplete payloads
 * still produce a complete Store.
 */
function normalizeStore(store: any): Store {
    const record = (store || {}) as Record<string, unknown>;
    return {
        incomeTutorialPassed: record['incomeTutorialPassed'] === true,
        obligationsTutorialPassed: record['obligationsTutorialPassed'] === true,
        expensesTutorialPassed: record['expensesTutorialPassed'] === true,
        welcomeTutorialPassed: record['welcomeTutorialPassed'] === true,
        currentPeriod: {
            name: (record['currentPeriod'] as any)?.name || '',
            month: toNumber((record['currentPeriod'] as any)?.month),
        },
        incomeItems: Array.isArray(record['incomeItems']) ? (record['incomeItems'] as Store['incomeItems']) : [],
        obligationItems: Array.isArray(record['obligationItems']) ? (record['obligationItems'] as Store['obligationItems']) : [],
        expenseItems: Array.isArray(record['expenseItems']) ? (record['expenseItems'] as Store['expenseItems']) : [],
        totalBudget: toNumber(record['totalBudget']),
        totalPercentageObligations: toNumber(record['totalPercentageObligations']),
        totalObligations: toNumber(record['totalObligations']),
        totalExpenses: toNumber(record['totalExpenses']),
        remainingBudget: toNumber(record['remainingBudget']),
        daylyBudget: toNumber(record['daylyBudget'] ?? (record as any)['dayilyBudget']),
        remains: toNumber(record['remains']),
    };
}
