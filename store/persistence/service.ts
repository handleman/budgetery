import { IStorageAdapter } from './types';
import { StorageRegistry } from './storage-registry';
import { Store } from '../types';
import { applyMigrations, CURRENT_MIGRATION_VERSION } from '../migrations';

export interface IPersistenceManager {
    initialize(): Promise<void>;
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    hasData(): Promise<boolean>;
}

export class PersistenceService implements IPersistenceManager {
    private static readonly INSTANCE_KEY = 'budgetery_persistence_service_initialized';
    
    private static instance: PersistenceService;
    
    public static getInstance(): PersistenceService {
        if (!PersistenceService.instance) {
            PersistenceService.instance = new PersistenceService();
        }
        return PersistenceService.instance;
    }

    private isInitialized = false;
    private storage: IStorageAdapter | null = null;
    private readonly storageKey = 'budgetery_store_v1';
    // Store the last saved version of the clean store for validation
    private lastSavedStore: Store | null = null;

    /**
     * Initialize persistence (call once at app startup)
     */
    public async initialize(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // Idempotency - if already initialized, just resolve
            if (this.isInitialized && this.storage) {
                console.log('[PersistenceService] Already initialized');
                resolve();
                return;
            }

            try {
                // Get registry and initialize storage adapter
                const registry = StorageRegistry.getInstance();
                await registry.initialize();
                
                this.storage = registry.getAdapter() || null;
                
                if (!this.storage) {
                    console.warn('[PersistenceService] No storage adapter available');
                    resolve();
                    return;
                }

                // Initialize platform-specific setups (e.g., IndexedDB create)
                if (typeof this.storage.init === 'function') {
                    await this.storage.init();
                }

                this.isInitialized = true;
                console.log('[PersistenceService] Successfully initialized');
                
                // Check for pending migrations
                const currentVersion = this.getStorageVersion() || 'v0';
                if (currentVersion !== 'v1') {
                    await this.runMigrations(currentVersion);
                }

                resolve();
            } catch (error) {
                console.error('[PersistenceService] Failed to initialize:', error);
                
                // Graceful degradation - store can work without persistence
                // Mark as initialized for graceful fallback mode
                this.isInitialized = true; 
                resolve();
            }
        });
    }

    /**
     * Load persisted store from storage
     */
    public async load(): Promise<Store | null> {
        if (!this.storage) {
            return null;
        }

        try {
            const storedData: Store | null = await this.storage.load();
            
            if (storedData && storedData.currentPeriod?.month !== undefined) {
                // Validate that the loaded data structure is compatible
                // Future-proofing for breaking schema changes in the future
            }

            return storedData;
        } catch (error) {
            console.error('[PersistenceService] Failed to load persisted state:', error);
            
            // Return null on error - let app use default/initial data
            return null;
        }
    }

    /**
     * Persist store to disk
     */
    public async save(store: Store): Promise<void> {
        if (!this.storage) {
            console.warn('[PersistenceService] Storage not initialized');
            return;
        }

        try {
            // Clean the store for storage (convert Dates, numbers, etc.)
            const storedData = this.cleanStoreForStorage(store);
            
            await this.storage.save(storedData);
            console.log('[PersistenceService] Saved to storage successfully');
            
            this.lastSavedStore = { ...store }; // Track last saved state
            
        } catch (error) {
            console.error('[PersistenceService] Failed to persist state:', error);
            throw error; // Let caller handle retry logic if needed
        }
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
            console.log('[PersistenceService] Storage cleared');
            this.lastSavedStore = null;
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
     * Get the current stored version of data (for version comparison)
     */
    private getStorageVersion(): string | null {
        // This would typically be stored alongside data or extracted from storage key
        // For now, assume single store - return latest version
        return 'v0'; // Default for first run
    }

    /**
     * Simple validation of loaded data before returning to UI
     */
    public isValidStore(store: any): store is Store {
        if (!store) return false;
        
        // Check required fields exist with correct types
        const isValidCurrentPeriod = 
            store.currentPeriod && 
            typeof store.currentPeriod.name === 'string' &&
            (typeof store.currentPeriod.month === 'number' || 
             typeof store.currentPeriod.month === 'string');

        const isValidItemsArray = 
            Array.isArray(store.incomeItems) && 
            Array.isArray(store.obligationItems) && 
            Array.isArray(store.expenseItems);
        
        const isValidNumbers = 
            typeof store.totalBudget === 'number' &&
            typeof store.remainingBudget === 'number' &&
            typeof store.dayilyBudget === 'number';

        return isValidCurrentPeriod && isValidItemsArray && isValidNumbers;
    }

    /**
     * Clean a store for JSON serialization (Date -> string, etc.)
     */
    private cleanStoreForStorage(store: Store): any {
        const result = {} as any;
        
        // Convert currentPeriod if needed
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

        // Process item arrays - convert to serializable format
        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const items = storeRecord[key] as Array<{ date?: Date | string; amount: number; label: string; isPercentage?: boolean }>;
            
            if (Array.isArray(items)) {
                result[key] = items.map((item) => ({
                    date: 
                        item.date instanceof Date ? item.date.toISOString() : 
                        (typeof item.date === 'string' ? item.date : ''),
                    amount: typeof item.amount === 'number' ? item.amount : 0,
                    label: item.label || '',
                    isPercentage: item.isPercentage !== undefined ? item.isPercentage : false,
                }));
            } else {
                result[key] = [];
            }
        });

        // Handle numeric fields safely
        ['totalBudget', 'remainingBudget', 'dayilyBudget'].forEach((key) => {
            const storeRecord = store as unknown as Record<string, unknown>;
            const value = storeRecord[key];
            result[key] = typeof value === 'number' ? Number(value) || 0 : (key.endsWith('udget') ? 0 : null);
        });

        return result;
    }

    /**
     * Run migrations when app updates
     */
    private async runMigrations(fromVersion: string): Promise<void> {
        // Convert fromVersion string to number if possible
        let currentVersion = parseInt(fromVersion.replace('v', ''), 10) || 0;
        
        const targetVersion = CURRENT_MIGRATION_VERSION;
        
        if (currentVersion < targetVersion) {
            console.log(`[Migrations] Running migrations from v${fromVersion} to v${targetVersion}`);
            
            // Apply stored migrations or skip if no changes needed for v1
        }
    }

    /**
     * Get the last saved clean store (used as fallback on load failures)
     */
    private async getFallbackStore(): Promise<Store | null> {
        return this.lastSavedStore || null;
    }
}
