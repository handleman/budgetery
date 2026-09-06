import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageAdapter, StorageOperation } from './types';
import { Store } from '../types';

export class AsyncStorageAdapter implements IStorageAdapter {
    private readonly storageKey = 'budgetery_store_v1';
    private storageRef!: typeof AsyncStorage;
    
    async init(): Promise<void> {
        try {
            this.storageRef = AsyncStorage;
        } catch (error) {
            console.error('Failed to initialize AsyncStorage:', error);
            throw error;
        }
    }

    async load(): Promise<Store | null> {
        try {
            const data = await this.storageRef.getItem(this.storageKey);
            
            if (!data) {
                return null;
            }

            const parsed = JSON.parse(data) as Store;
            
            // Restore Date objects from ISO strings
            const restoredStore = this.restoreDates(parsed);
            return restoredStore;
        } catch (error) {
            console.error('Failed to load persisted state:', error);
            return null;
        }
    }

    async save(store: Store): Promise<void> {
        try {
            if (!this.storageRef) throw new Error('AsyncStorage not initialized');

            const cleanedStore = this.cleanStoreForStorage(store);
            
            await this.storageRef.setItem(
                this.storageKey, 
                JSON.stringify(cleanedStore)
            );
        } catch (error) {
            console.error('Failed to persist state:', error);
            throw error; // Re-throw so callers can handle retry logic
        }
    }

    async clear(): Promise<void> {
        try {
            if (!this.storageRef) throw new Error('AsyncStorage not initialized');
            await this.storageRef.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear storage:', error);
            throw error;
        }
    }

    async transaction<T>(operations: StorageOperation[]): Promise<T | void> {
        if (operations.length === 0) {
            return {} as T;
        }

        try {
            if (!this.storageRef) throw new Error('AsyncStorage not initialized');

            for (const op of operations) {
                if (op.type === 'WRITE' && op.value !== undefined) {
                    await this.storageRef.setItem(op.key || this.storageKey, JSON.stringify(op.value));
                } else if (op.type === 'DELETE') {
                    await this.storageRef.removeItem(op.key || this.storageKey);
                }
            }
        } catch (error) {
            console.error('Failed to execute storage transaction:', error);
            throw error;
        }
    }

    private cleanStoreForStorage(store: Store): Partial<Record<string, any>> {
        const result = {} as any;
        
        // Convert Date objects to ISO strings
        if (store.currentPeriod) {
            result.currentPeriod = {
                name: store.currentPeriod.name || '',
                month: Array.isArray(store.currentPeriod.month) 
                    ? store.currentPeriod.month[0] 
                    : typeof store.currentPeriod.month === 'string' 
                    ? Number(store.currentPeriod.month) 
                    : store.currentPeriod.month || 0,
            };
        }

        // Process item arrays - convert to serializable format
        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const items = (storeRecord[key] as Array<{ date?: Date | string; amount: number; label: string; isPercentage?: boolean }> || []) as Array<{ date?: Date | string; amount: number; label: string; isPercentage?: boolean }>;
            
            result[key] = items.map((item) => ({
                date: item.date instanceof Date ? item.date.toISOString() : (item.date || ''),
                amount: item.amount,
                label: item.label || '',
                isPercentage: item.isPercentage !== undefined ? item.isPercentage : false,
            }));
        });

        // Handle numeric fields
        ['totalBudget', 'remainingBudget', 'daylyBudget'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const value = storeRecord[key];
            result[key] = typeof value === 'number' ? Number(value) || 0 : 0;
        });

        // Handle boolean flags
        ['incomeTutorialPassed', 'obligationsTutorialPassed', 
         'expensesTutorialPassed', 'welcomeTutorialPassed'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            if (store.hasOwnProperty(key)) {
                result[key] = !!storeRecord[key];
            }
        });

        return result;
    }

    private restoreDates(store: any): any {
        // Convert ISO strings back to Date objects for the UI layer
        const restored = { ...store };

        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const items = (restored[key] || []).map((item: any) => {
                if (item && typeof item.date === 'string' && item.date) {
                    const parsed = new Date(item.date);
                    if (!isNaN(parsed.getTime())) {
                        return { ...item, date: parsed };
                    }
                }
                return item;
            });
            restored[key] = items;
        });

        return restored;
    }
}
