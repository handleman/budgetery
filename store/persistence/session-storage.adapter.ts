import { IStorageAdapter, StorageOperation } from './types';
import { Store } from '../types';

export class SessionStorageAdapter implements IStorageAdapter {
    private readonly storageKey = 'budgetery_store_v1';

    async load(): Promise<Store | null> {
        const data = sessionStorage.getItem(this.storageKey);

        if (!data) {
            return null;
        }

        try {
            const parsed = JSON.parse(data) as Store;
            return this.restoreDates(parsed);
        } catch (error) {
            console.error('Failed to parse stored data:', error);
            return null;
        }
    }

    async save(store: Store): Promise<void> {
        try {
            const cleanedStore = this.cleanStoreForStorage(store);

            sessionStorage.setItem(
                this.storageKey,
                JSON.stringify(cleanedStore)
            );
        } catch (error) {
            console.error('Failed to persist state:', error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw error;
        }
    }

    async transaction<T>(operations: StorageOperation[]): Promise<T | void> {
        if (operations.length === 0) {
            return {} as T;
        }

        // SessionStorage holds a single JSON blob: apply operations as
        // top-level field writes/deletes, then persist the result.
        const current = (await this.load() || {}) as unknown as Record<string, unknown>;
        for (const op of operations) {
            if (op.type === 'WRITE') {
                current[op.key] = op.value;
            } else if (op.type === 'DELETE') {
                delete current[op.key];
            }
        }
        await this.save(current as unknown as Store);
        return current as unknown as T;
    }

    private restoreDates(store: Store): Store {
        const restored = { ...(store as unknown as Record<string, unknown>) };

        (['incomeItems', 'obligationItems', 'expenseItems'] as const).forEach((key) => {
            const items = restored[key];
            if (Array.isArray(items)) {
                restored[key] = (items as any[]).map((item: any) => {
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

    private cleanStoreForStorage(store: any): Partial<Record<string, any>> {
        const result = {} as any;
        
        // Convert Date objects to ISO strings for JSON serialization
        if (store.currentPeriod && typeof store.currentPeriod.month === 'string') {
            try {
                result.currentPeriod = {
                    name: store.currentPeriod.name || '',
                    month: Number(store.currentPeriod.month),
                };
            } catch (e) {
                result.currentPeriod = store.currentPeriod;
            }
        } else if (store.currentPeriod && typeof store.currentPeriod.month === 'number') {
            result.currentPeriod = store.currentPeriod;
        }

        // Process item arrays with cleaned dates
        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const items = store[key] || [];
            
            if (Array.isArray(items)) {
                result[key] = items.map((item: any) => ({
                    date: item.date instanceof Date ? item.date.toISOString() : (item.date || ''),
                    amount: typeof item.amount === 'number' ? item.amount : 0,
                    label: item.label || '',
                    isPercentage: item.isPercentage !== undefined ? item.isPercentage : false,
                }));
            } else {
                result[key] = [];
            }
        });

        // Handle numeric fields safely
        ['totalBudget', 'remainingBudget', 'daylyBudget'].forEach((key) => {
            const value = store[key];
            result[key] = typeof value === 'number' ? Number(value) || 0 : 0;
        });

        // Handle boolean flags
        ['incomeTutorialPassed', 'obligationsTutorialPassed', 
         'expensesTutorialPassed', 'welcomeTutorialPassed'].forEach((key) => {
            if (store.hasOwnProperty(key)) {
                result[key] = !!store[key];
            }
        });

        return result;
    }
}
