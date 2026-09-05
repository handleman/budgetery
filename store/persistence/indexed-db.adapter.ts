import { IStorageAdapter, StorageOperation } from './types';
import { Store } from '../types';

export class IndexedDBAdapter implements IStorageAdapter {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'Budgetery';
    private readonly storeName = 'budget_store';
    
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = (event: any) => {
                console.error('IndexedDB open error:', event.target?.error);
                reject(request.error);
            };

            request.onupgradeneeded = (event: any) => {
                const database = (event.target as IDBOpenDBRequest).result;
                
                if (!database.objectStoreNames.contains(this.storeName)) {
                    const store = database.createObjectStore(
                        this.storeName,
                        { keyPath: 'id', autoIncrement: true }
                    );
                    
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('version', 'version', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve();
            };
        });
    }

    async load(): Promise<Store | null> {
        if (!this.db) {
            try {
                await this.init();
            } catch (error) {
                console.error('Failed to initialize IndexedDB:', error);
                return null;
            }
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            // Get all records and use the latest one
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = () => {
                if (getAllRequest.result.length === 0) {
                    resolve(null);
                } else {
                    // Restore Date objects for UI layer
                    resolve(this.restoreDates(getAllRequest.result[getAllRequest.result.length - 1]));
                }
            };
            
            getAllRequest.onerror = () => {
                console.error('IndexedDB load failed', getAllRequest.error);
                resolve(null);
            };
        });
    }

    async save(store: Store): Promise<void> {
        if (!this.db) {
            try {
                await this.init();
            } catch (error) {
                console.error('Failed to initialize IndexedDB:', error);
                return;
            }
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const storeObj = transaction.objectStore(this.storeName);
            
            const record = {
                id: null as unknown as number, // auto-increment
                timestamp: Date.now(),
                version: 'v1',
                data: this.cleanStoreForDB(store),
            };

            const putRequest = storeObj.put(record);
            
            putRequest.onsuccess = () => {
                resolve();
            };
            
            putRequest.onerror = (event?: Event) => {
                const error = event?.target?.error || new Error('Unknown error');
                console.error('IndexedDB save failed:', error);
                reject(error);
            };
        });
    }

    async clear(): Promise<void> {
        if (!this.db) {
            try {
                await this.init();
            } catch (error) {
                console.error('Failed to initialize IndexedDB:', error);
                return;
            }
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const storeObj = transaction.objectStore(this.storeName);
            
            const clearRequest = storeObj.clear();
            
            clearRequest.onsuccess = () => {
                resolve();
            };
            
            clearRequest.onerror = () => {
                console.error('IndexedDB clear failed:', clearRequest.error);
                reject(clearRequest.error);
            };
        });
    }

    async transaction<T>(operations: StorageOperation[]): Promise<T> {
        // IndexedDB handles batched operations through transactions
        // This is a simplified example - full implementation would use indexedDB.batch
        if (operations.length === 0) {
            return {} as T;
        }

        try {
            if (!this.db || !this.db.transaction) {
                throw new Error('IndexedDB not initialized');
            }

            // For a simplified implementation, we'll just save the whole store again
            const currentStore = await this.load();
            await this.save(currentStore as Store);
            
            return {} as T;
        } catch (error) {
            console.error('Failed to execute storage transaction:', error);
            throw error;
        }
    }

    private cleanStoreForDB(store: Store): Record<string, any> {
        const result = {} as any;
        
        // Convert Date to ISO string
        if (store.currentPeriod && typeof store.currentPeriod.month === 'string') {
            try {
                result.currentPeriod = {
                    name: store.currentPeriod.name || '',
                    month: Array.isArray(store.currentPeriod.month) 
                        ? store.currentPeriod.month[0] 
                        : Number(store.currentPeriod.month),
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

    private restoreDates(store: any): any {
        const restored = { ...store };
        
        // Attempt to restore Date objects (optional, depending on use case)
        try {
            if (restored.currentPeriod && typeof restored.currentPeriod.month === 'string') {
                restored.currentPeriod.month = Number(restored.currentPeriod.month);
            }
            
            ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
                const items = restored[key] || [];
                
                if (Array.isArray(items)) {
                    const restoredItems = items.map((item: any) => {
                        if (item.date && typeof item.date === 'string') {
                            try {
                                item.date = new Date(item.date);
                            } catch (e) {}
                        }
                        return item;
                    });
                }
            });
        } catch (e) {
            // Ignore restore errors
        }

        return restored;
    }
}
