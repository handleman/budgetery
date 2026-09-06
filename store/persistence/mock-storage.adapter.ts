import { IStorageAdapter } from './types';
import { Store } from '../types';

export class MockStorageAdapter implements IStorageAdapter {
    // In-memory storage for testing
    private readonly storageKey = 'budgetery_store_v1';
    private data: Record<string, any> = {};
    
    async load(): Promise<Store | null> {
        return this.data[this.storageKey] || 
               (this.data.mockData ? this.restoreDates(this.data.mockData) : null);
    }

    async save(store: Store): Promise<void> {
        const cleanedStore = this.cleanStoreForStorage(store);
        
        if (process.env.NODE_ENV === 'test') {
            this.data.mockData = cleanedStore;
        } else {
            this.data[this.storageKey] = cleanedStore;
        }

        // Simulate async storage for testing UI responsiveness
        return new Promise(resolve => setTimeout(resolve, 0));
    }

    async clear(): Promise<void> {
        this.data[this.storageKey] = undefined;
        if (process.env.NODE_ENV === 'test') {
            delete this.data.mockData;
        }
    }

    async transaction<T>(operations: any[]): Promise<T> {
        // Mock implementation - just save current state
        await this.save(this.data[this.storageKey] || (this.data.mockData ? this.restoreDates(this.data.mockData) : {}));
        return {} as T;
    }

    private cleanStoreForStorage(store: Store): any {
        const result = {} as any;
        
        if (store.currentPeriod && typeof store.currentPeriod.month === 'string') {
            try {
                const monthNum = Array.isArray(store.currentPeriod.month) 
                    ? store.currentPeriod.month[0] 
                    : Number(store.currentPeriod.month);
                
                result.currentPeriod = {
                    name: store.currentPeriod.name || '',
                    month: isNaN(monthNum) ? 0 : monthNum,
                };
            } catch (e) {}
        } else if (store.currentPeriod) {
            result.currentPeriod = store.currentPeriod;
        }

        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const items = (storeRecord[key] as unknown[]) || [];

            if (Array.isArray(items)) {
                result[key] = (items as any[]).map((item: any) => ({
                    date:
                        item.date instanceof Date
                            ? item.date.toISOString()
                            : typeof item.date === 'string'
                              ? item.date
                              : '',
                    amount: typeof item.amount === 'number' ? item.amount : 0,
                    label: item.label || '',
                    isPercentage: item.isPercentage === true,
                }));
            } else {
                result[key] = [];
            }
        });

        ['totalBudget', 'totalPercentageObligations', 'totalObligations', 'totalExpenses', 'remainingBudget', 'daylyBudget', 'remains'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const value = storeRecord[key];
            result[key] = typeof value === 'number' ? value : 0;
        });

        ['incomeTutorialPassed', 'obligationsTutorialPassed', 'expensesTutorialPassed', 'welcomeTutorialPassed'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            result[key] = storeRecord[key] === true;
        });

        return result;
    }

    private restoreDates(store: any): any {
        const restored = { ...store };

        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
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

        return restored;
    }
}
