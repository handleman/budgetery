export class SessionStorageAdapter {
    private readonly storageKey = 'budgetery_store_v1';
    
    async load(): Promise<any | null> {
        const data = sessionStorage.getItem(this.storageKey);
        
        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data) as any;
        } catch (error) {
            console.error('Failed to parse stored data:', error);
            return null;
        }
    }

    async save(store: any): Promise<void> {
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

    async transaction<T>(operations: any[]): Promise<T> {
        // SessionStorage is limited - operations are typically independent
        for (const op of operations) {
            await this.save(null as any); // Clear and re-load
            const data = sessionStorage.getItem(this.storageKey);
            return JSON.parse(data || '{}') as T;
        }
        return {} as T;
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
