import { IStorageAdapter } from './types';
import { AsyncStorageAdapter } from './async-storage.adapter';
import { SessionStorageAdapter } from './session-storage.adapter';
import { IndexedDBAdapter } from './indexed-db.adapter';

export class StorageRegistry {
    private static instance: StorageRegistry;
    private currentAdapter: IStorageAdapter | null = null;
    private readonly adapterFactories: Map<string, () => IStorageAdapter> = new Map();
    private pendingOperations: Promise<void> | null = null;
    private readonly storageKey = 'budgetery_store_v1';

    private constructor() {}

    public static getInstance(): StorageRegistry {
        if (!StorageRegistry.instance) {
            StorageRegistry.instance = new StorageRegistry();
        }
        return StorageRegistry.instance;
    }

    /**
     * Register a custom adapter for advanced use cases
     */
    public registerAdapter(name: string, factory: () => IStorageAdapter): void {
        this.adapterFactories.set(name, factory);
    }

    /**
     * Initialize adapter based on platform detection
     * This is the main entry point - call once at app startup
     */
    public async initialize(): Promise<IStorageAdapter> {
        const platform = StorageRegistry.detectPlatform();
        
        console.log(`[StorageRegistry] Detected platform: ${platform}`);

        try {
            switch (platform) {
                case 'ios':
                case 'android':
                    // React Native environment - prefer AsyncStorage
                    if (!this.currentAdapter) {
                        this.currentAdapter = new AsyncStorageAdapter();
                        await (this.currentAdapter as any).init();
                    }
                    break;
                
                case 'web':
                    // Browser environment
                    const indexedDBAvailable = 'indexedDB' in ((globalThis as unknown) as Window & typeof globalThis);
                    
                    console.log(`[StorageRegistry] IndexedDB available: ${!!indexedDBAvailable}`);

                    if (indexedDBAvailable && !this.currentAdapter) {
                        this.currentAdapter = new IndexedDBAdapter();
                        await (this.currentAdapter as any).init();
                    } else if (!this.currentAdapter) {
                        // Fallback to browser native sessionStorage
                        this.currentAdapter = new SessionStorageAdapter();
                        console.log('[StorageRegistry] Using sessionStorage fallback');
                    }
                    
                    // For web, we may also want to add a "load demo data" mode
                    const loadDemoData = await ((globalThis as unknown) as Window & typeof globalThis).expoConfig?.loadDemoData || false;
                    if (loadDemoData) {
                        // Load some sample data for testing on first run
                        const sampleStore = await this.loadSampleData();
                        if (sampleStore) {
                            console.log('[StorageRegistry] Loading demo data');
                            // But don't save it - let user start fresh or use real data later
                        }
                    }
                    
                    break;
                
                default:
                    // Fallback for other environments
                    const fallback = new AsyncStorageAdapter();
                    this.currentAdapter = fallback;
                    console.log('[StorageRegistry] Using AsyncStorage-compatible approach');
            }

            // Execute any pending operations if adapter just got initialized
            if (this.pendingOperations) {
                try {
                    await this.flushPendingOperations();
                    console.log('[StorageRegistry] All pending operations completed');
                } catch (error) {
                    console.error('[StorageRegistry] Failed to flush pending operations:', error);
                    this.pendingOperations = null;
                }
            }
            
            return this.currentAdapter!;
        } catch (error) {
            console.error('[StorageRegistry] Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Detect the current platform using Expo APIs or native detection
     */
    private static detectPlatform(): 'ios' | 'android' | 'web' | 'other' {
        // Prefer Expo's own runtime platform detection
        const expoPlatform = (globalThis as any).__expo_runtime_platform || 
                           (globalThis.navigator?.platform?.toLowerCase());
        
        if (!expoPlatform) {
            // No reliable signal - guess based on IndexedDB availability
            if ('IndexedDB' in globalThis || 'indexedDB' in navigator) {
                return 'web';
            }
            
            // React Native AsyncStorage usually means mobile
            try {
                require('react-native');
                const expoPlatformFromRuntime = ((globalThis as any).__expo_runtime_platform);
                if (expoPlatformFromRuntime) {
                    return expoPlatformFromRuntime;
                }
                return 'other';
            } catch (e) {
                return 'other';
            }
        }

        if (expoPlatform.includes('ios')) return 'ios';
        if (expoPlatform.includes('android')) return 'android';
        
        // Web check - look at the platform string or IndexedDB availability
        const isWebPlatform = expoPlatform.includes('win') || 
                            expoPlatform.includes('mac') ||
                            expoPlatform.includes('linux') ||
                            !!navigator;
                            
        if (isWebPlatform) {
            return 'web';
        }

        return 'other';
    }

    /**
     * Load and return demo/sample data for testing on first run
     */
    private async loadSampleData(): Promise<any | null> {
        try {
            const { Store } = await import('../types');
            const defaultStore: any = {
                incomeTutorialPassed: false,
                obligationsTutorialPassed: false,
                expensesTutorialPassed: false,
                welcomeTutorialPassed: false,
                currentPeriod: {
                    name: 'November',
                    month: 10, // November is index 10 (0-based months)
                },
                incomeItems: [
                    { date: new Date(), amount: 5000, label: 'Salary' },
                    { date: new Date(), amount: 100, label: 'Cashback' },
                ],
                obligationItems: [
                    { date: new Date(), amount: 2000, label: 'Rent', isPercentage: false },
                    { date: new Date(), amount: 357.69, label: 'Insurance (15%)', isPercentage: true },
                ],
                expenseItems: [],
                totalBudget: 5100,
                totalPercentageObligations: 766.84,
                totalObligations: 2766.84,
                totalExpenses: 0,
                remainingBudget: 2333.16,
                dayilyBudget: 81.11, // Example value
                remains: 2333.16,
            };

            return defaultStore;
        } catch (error) {
            console.error('[StorageRegistry] Failed to load sample data:', error);
            return null;
        }
    }

    private async flushPendingOperations(): Promise<void> {
        if (!this.currentAdapter || !this.pendingOperations) {
            return;
        }

        try {
            await this.pendingOperations;
            this.pendingOperations = null;
            console.log('[StorageRegistry] Pending operations flushed successfully');
        } catch (error) {
            console.error('[StorageRegistry] Failed to flush pending operations:', error);
            this.pendingOperations = null;
        }
    }

    /**
     * Queue an operation for batch execution
     * Useful for deferring storage writes until after a mutation completes
     */
    public queueOp<T>(operation: () => Promise<T>): Promise<T> {
        const op = operation();

        if (this.pendingOperations) {
            // Append to existing queue
            return this.pendingOperations
                .then(() => op)
                .catch((err) => {
                    console.error('[StorageRegistry] Queue error:', err);
                    throw err;
                })
                .finally(() => {
                    if (this.pendingOperations === op) {
                        this.pendingOperations = null;
                    }
                });
        }

        // Initial operation becomes the current pending one
        this.pendingOperations = op.then(() => {
            this.pendingOperations = null;
            console.log('[StorageRegistry] Operation completed');
        }).catch(err => {
            console.error('[StorageRegistry] Operation failed:', err);
            throw err;
        });

        return op;
    }

    public getAdapter(): IStorageAdapter | null {
        return this.currentAdapter;
    }

    /**
     * Check if storage is initialized and ready
     */
    public async isReady(): Promise<boolean> {
        if (this.currentAdapter) {
            try {
                // Just a light check - doesn't need actual operations
                return true;
            } catch (error) {
                console.error('[StorageRegistry] Storage readiness check failed:', error);
                return false;
            }
        }
        return false;
    }

    /**
     * Clear the adapter reference (for edge case resets)
     */
    public reset(): void {
        this.currentAdapter = null;
        this.pendingOperations = null;
    }
}
