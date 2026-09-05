import { IStorageAdapter } from './types';
import { Store } from '../types';

export class MockStorageAdapter implements IStorageAdapter {
    // In-memory storage for testing
    private readonly storageKey = 'budgetery_store_v1';
    
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
            const items = store[key] || [];
            
            if (Array.isArray(items)) {
                result[key] = items.map((item: any) => ({
                    date: item.date instanceof Date ? item.date.toISOString() : '',
                    amount: typeof item.amount === 'number' ? item.amount : 0,
                    label: item.label || '',
                    isPercentage: item.isPercentage !== undefined ? item.isPercentage : false,
                }));
            } else {
                result[key] = [];
            }
        });

        ['totalBudget', 'remainingBudget', 'dayilyBudget'].forEach((key) => {
            const value = store[key];
            result[key] = typeof value === 'number' ? Number(value) || 0 : (key.endsWith('udget') ? 0 : null);
        });

        return result;
    }

    private restoreDates(store: any): any {
        // Already in date format when loading from mock - no conversion needed
        return store;
    }
}
