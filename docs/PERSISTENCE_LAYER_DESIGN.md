# Persistence Layer Design Document

## Overview

This document outlines the architecture for adding a persistence layer to Budgetery's current state management system. The solution must be:

- **Modular**: Easy to swap storage backends without affecting business logic
- **Lightweight**: Minimal overhead, no external dependencies where possible
- **Universal**: Works across Web, iOS (React Native), and Android (React Native)
- **Interface-driven**: Abstract storage operations behind a consistent contract

---

## Current Architecture Analysis

### State Management Setup

```typescript
// store/context.tsx
const defaultStore: Store = {
    incomeTutorialPassed: false,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
    welcomeTutorialPassed: false,
    currentPeriod: { name: '', month: 0 },
    incomeItems: [],
    obligationItems: [],
    expenseItems: [],
    totalBudget: 0,
    // ... more fields
};

// Context provider wraps useReducer
const [store, dispatch] = useReducer(appReducer, defaultStore);
```

**Key Observations:**
1. State is initialized with `defaultStore` - no persistence currently
2. Mutators are synchronous functions that call reducers
3. No hydrate/reload mechanism exists
4. Expo environment available for platform-specific APIs

---

## Proposed Architecture

### 1. Abstraction Layer Design

```typescript
// store/persistence/types.ts (NEW)

export interface IStorageAdapter {
    // Sync API for immediate reads/writes
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    
    // Optional batch operations for efficiency
    transaction<T>(operations: StorageOperation[]): Promise<T>;
}

export interface StorageOperation {
    type: 'WRITE' | 'DELETE';
    key: string;
    value?: unknown;
}
```

### 2. Backend Implementations

#### a) AsyncStorage (iOS & Android - React Native Standard)

```typescript
// store/persistence/async-storage.adapter.ts (NEW)

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageAdapter implements IStorageAdapter {
    private readonly storageKey = 'budgetery_store_v1';
    
    async load(): Promise<Store | null> {
        try {
            const data = await AsyncStorage.getItem(this.storageKey);
            return data ? (JSON.parse(data) as Store) : null;
        } catch {
            return null;
        }
    }

    async save(store: Store): Promise<void> {
        try {
            await AsyncStorage.setItem(
                this.storageKey, 
                JSON.stringify(this.serializeStore(store))
            );
        } catch (error) {
            // Log error, fail silently for background persistence
            console.error('Failed to persist store:', error);
        }
    }

    async clear(): Promise<void> {
        await AsyncStorage.removeItem(this.storageKey);
    }

    private serializeStore(store: Store): string {
        const cleanStore = { ...store, currentPeriod: this.cleanDate(store.currentPeriod) };
        return JSON.stringify(cleanStore);
    }

    private cleanDate(date: any): any {
        // Convert Date objects to ISO strings for JSON serialization
        if (date && date.toISOString) {
            return date.toISOString();
        }
        return date;
    }
}
```

#### b) Session Storage (Web Fallback)

```typescript
// store/persistence/session-storage.adapter.ts (NEW)

export class SessionStorageAdapter implements IStorageAdapter {
    private readonly storageKey = 'budgetery_store_v1';
    
    async load(): Promise<Store | null> {
        const data = sessionStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : null;
    }

    async save(store: Store): Promise<void> {
        try {
            sessionStorage.setItem(
                this.storageKey, 
                JSON.stringify(this.cleanStoreForStorage(store))
            );
        } catch (error) {
            console.error('Failed to persist store:', error);
        }
    }

    async clear(): Promise<void> {
        sessionStorage.removeItem(this.storageKey);
    }

    private cleanStoreForStorage(store: Store): Record<string, unknown> {
        const result = {} as any;
        
        // Convert Date objects
        result.currentPeriod = {
            name: store.currentPeriod.name,
            month: typeof store.currentPeriod.month === 'string' 
                ? Number(store.currentPeriod.month) 
                : store.currentPeriod.month,
        };

        // Arrays with stringified or cleaned values
        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            const items = store[key] || [];
            result[key] = items.map((item: any) => ({
                date: item.date?.toISOString() || '',
                amount: item.amount,
                label: item.label,
                isPercentage: item.isPercentage !== undefined ? item.isPercentage : false,
            }));
        });

        // Numbers stay as-is
        ['totalBudget', 'remainingBudget', 'daylyBudget'].forEach((key) => {
            const value = store[key];
            result[key] = typeof value === 'number' ? value : 0;
        });

        // Boolean flags
        ['incomeTutorialPassed', 'obligationsTutorialPassed', 
         'expensesTutorialPassed', 'welcomeTutorialPassed'].forEach((key) => {
            if (store.hasOwnProperty(key)) {
                result[key] = !!store[key];
            }
        });

        return result;
    }
}
```

#### c) IndexedDB (Web Primary Storage)

```typescript
// store/persistence/indexed-db.adapter.ts (NEW)

export class IndexedDBAdapter implements IStorageAdapter {
    private db: IDBDatabase | null = null;
    private readonly dbName = 'Budgetery';
    private readonly storeName = 'budget_store';
    
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const database = (event.target as any).result;
                
                if (!database.objectStoreNames.contains(this.storeName)) {
                    const store = database.createObjectStore(
                        this.storeName,
                        { keyPath: 'id', autoIncrement: true }
                    );
                    
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async load(): Promise<Store | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            
            // Get latest store by timestamp index
            const request = store.getAll();
            request.onsuccess = () => {
                if (request.result.length === 0) {
                    resolve(null);
                } else {
                    resolve(request.result[request.result.length - 1]);
                }
            };
            request.onerror = () => resolve(null);
        });
    }

    async save(store: Store): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const record = {
                timestamp: Date.now(),
                data: this.cleanStoreForDB(store),
            };

            store.put(record).onsuccess = () => resolve();
            store.onerror = () => reject(request.error);
        });
    }

    async clear(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            store.clear().onsuccess = () => resolve();
            store.onerror = () => reject(request.error);
        });
    }

    private cleanStoreForDB(store: Store): Record<string, unknown> {
        // Same cleaning logic as SessionStorageAdapter
        const result = {} as any;
        
        result.currentPeriod = {
            name: store.currentPeriod.name,
            month: typeof store.currentPeriod.month === 'string' 
                ? Number(store.currentPeriod.month) 
                : store.currentPeriod.month,
        };

        ['incomeItems', 'obligationItems', 'expenseItems'].forEach((key) => {
            result[key] = (store[key] || []).map((item: any) => ({
                date: item.date?.toISOString(),
                amount: item.amount,
                label: item.label,
                isPercentage: item.isPercentage || false,
            }));
        });

        return result;
    }
}
```

### 3. Factory/Registry Pattern

```typescript
// store/persistence/storage-registry.ts (NEW)

import { IStorageAdapter } from './types';
import { AsyncStorageAdapter } from './async-storage.adapter';
import { SessionStorageAdapter } from './session-storage.adapter';
import { IndexedDBAdapter } from './indexed-db.adapter';

export class StorageRegistry {
    private static instance: StorageRegistry;
    private currentAdapter: IStorageAdapter | null = null;
    private readonly adapterFactories: Map<string, () => IStorageAdapter> = new Map();
    private pendingOperations: Promise<void> | null = null;

    private constructor() {}

    public static getInstance(): StorageRegistry {
        if (!StorageRegistry.instance) {
            StorageRegistry.instance = new StorageRegistry();
        }
        return StorageRegistry.instance;
    }

    // Register custom adapters (for advanced use cases)
    public registerAdapter(name: string, factory: () => IStorageAdapter): void {
        this.adapterFactories.set(name, factory);
    }

    // Initialize adapter based on platform detection
    public async initialize(): Promise<IStorageAdapter> {
        const platform = StorageRegistry.detectPlatform();
        
        switch (platform) {
            case 'ios':
            case 'android':
                // React Native environment - prefer AsyncStorage
                if (!this.currentAdapter) {
                    this.currentAdapter = new AsyncStorageAdapter();
                }
                break;
            
            case 'web':
                // Browser environment - prefer IndexedDB over SessionStorage
                // Fallback to SessionStorage if IndexedDB not available
                const indexedDBAvailable = 'indexedDB' in window;
                
                if (indexedDBAvailable && !this.currentAdapter) {
                    this.currentAdapter = new IndexedDBAdapter();
                } else if (!this.currentAdapter) {
                    this.currentAdapter = new SessionStorageAdapter();
                }
                break;
            
            default:
                // Fallback to AsyncStorage-compatible approach
                const fallback = new AsyncStorageAdapter();
                this.currentAdapter = fallback;
        }

        // Execute pending operations if any
        await this.flushPendingOperations();
        
        return this.currentAdapter!;
    }

    private static detectPlatform(): 'ios' | 'android' | 'web' | 'other' {
        // Detect Expo platform
        const expoPlatform = (globalThis as any).__expo_runtime_platform || 
                           (globalThis.navigator?.platform?.toLowerCase());
        
        if (!expoPlatform) return 'other';

        if (expoPlatform.includes('ios')) return 'ios';
        if (expoPlatform.includes('android')) return 'android';
        
        // Web check - look at the platform string or IndexedDB availability
        if ((globalThis as any).expoConstants?.platform === 'web') {
            return 'web';
        }

        // Additional web detection
        if ('IndexedDB' in globalThis || 'storage' in globalThis) {
            return 'web';
        }

        return 'other';
    }

    private async flushPendingOperations(): Promise<void> {
        if (!this.currentAdapter || !this.pendingOperations) {
            return;
        }

        try {
            await this.pendingOperations;
            this.pendingOperations = null;
        } catch (error) {
            console.error('Failed to flush pending operations:', error);
            this.pendingOperations = null;
        }
    }

    // Queue operations for batch execution
    public queueOp<T>(operation: () => Promise<T>): Promise<T> {
        const op = operation();

        if (this.pendingOperations) {
            // Append to existing queue
            return this.pendingOperations
                .then(() => op)
                .catch((err) => {
                    console.error('Queue error:', err);
                    throw err;
                });
        }

        // Initial operation becomes current
        this.pendingOperations = op.then(() => {
            this.pendingOperations = null;
        }).catch(err => {
            console.error('Operation failed:', err);
            throw err;
        });

        return op;
    }

    public getAdapter(): IStorageAdapter | null {
        return this.currentAdapter;
    }
}
```

### 4. Persistence Service Wrapper

```typescript
// store/persistence/service.ts (NEW)

import { AppContext, Store } from '../types';
import { StorageRegistry } from './storage-registry';

export class PersistenceService {
    private isInitialized = false;
    private storage: ReturnType<StorageRegistry['getAdapter']> | null = null;
    private initPromise: Promise<void> | null = null;

    /**
     * Initialize persistence (call once at app startup)
     */
    async initialize(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            // If already initializing, wait for completion
            if (this.initPromise) {
                try {
                    await this.initPromise;
                    resolve();
                } catch (error) {
                    reject(error);
                }
                return;
            }

            try {
                this.storage = StorageRegistry.getInstance().getAdapter();
                
                // Optionally initialize IndexedDB if using that adapter
                if (this.storage && typeof storage.init === 'function') {
                    await storage.init();
                }

                this.isInitialized = true;
                resolve();
            } catch (error) {
                console.error('Failed to initialize persistence:', error);
                // Don't fail the app - continue without persistence
                this.isInitialized = true; // Consider success for graceful degradation
                resolve();
            }
        });
    }

    /**
     * Hydrate store from storage
     */
    async hydrate(): Promise<Store | null> {
        if (!this.storage || !this.isInitialized) return null;

        try {
            return await this.storage.load();
        } catch (error) {
            console.error('Failed to load persisted state:', error);
            return null;
        }
    }

    /**
     * Persist store to disk
     */
    async save(store: Store): Promise<void> {
        if (!this.storage || !this.isInitialized) return;

        try {
            await this.storage.save(cleanStoreForStorage(store));
        } catch (error) {
            console.error('Failed to persist state:', error);
            // Silent fail for offline scenarios
        }
    }

    /**
     * Clear all persisted data
     */
    async clear(): Promise<void> {
        if (!this.storage || !this.isInitialized) return;

        try {
            await this.storage.clear();
        } catch (error) {
            console.error('Failed to clear storage:', error);
        }
    }

    /**
     * Check if any data is persisted
     */
    async hasData(): Promise<boolean> {
        const store = await this.load();
        return !!store && Object.keys(store).length > 0;
    }
}

// Helper to clean Date objects for serialization
function cleanStoreForStorage<T extends Record<string, any>>(store: T): Record<string, any> {
    // Create shallow copy with cleaning logic
    const result = {} as any;
    
    ['currentPeriod'].forEach((key) => {
        const value = (store as any)[key];
        if (value && typeof value === 'object' && value.toISOString) {
            result[key] = { ...value }; // Add cleaning logic
        } else {
            result[key] = value;
        }
    });

    // Process Date fields and convert to strings/numbers as needed
    return result;
}
```

### 5. Integration with Existing Store

#### Option A: Persistent Context Pattern

```typescript
// store/context.tsx (MODIFIED)

import { PersistenceService } from '../persistence/service';

const persistence = new PersistenceService();

export const appContext = createContext<AppContext>({
    store: defaultStore,
    mutators: {},
});

type AppContextProviderProps = React.PropsWithChildren<{ 
    initialData?: Store 
}>;

export const AppContextProvider: FC<AppContextProviderProps> = ({ 
    children, 
    initialData 
}) => {
    // Initialize persistence on first load
    useEffect(() => {
        persistence.initialize().then(() => {
            // Load hydrated data if available
            persistence.hasData()
                .then(async (hasData) => {
                    if (hasData) {
                        const storedStore = await persistence.hydrate();
                        
                        if (storedStore) {
                            // Merge stored state with provider's initial/default state
                            updateStore(storedStore);
                            
                            // Save merged store back to ensure consistency
                            await persistence.save(currentStoreRef.current);
                        } else {
                            // No persisted data, use default/initial provided
                            if (!initialData) {
                                updateStore(defaultStore);
                            }
                        }
                    } else if (!initialData && !hasPersistedData()) {
                        // First run or storage empty - load demo data if needed
                    }
                })
                .catch(console.error);
        });
    }, []);

    // Ref to track current (possibly modified) store state
    const currentStoreRef = useRef(defaultStore);

    const updateStore = (newValue: Store): void => {
        currentStoreRef.current = newValue;
        
        // Trigger React updates by updating context
        const updatedContextValue: AppContext = {
            store: currentStoreRef.current,
            mutators: getMutators(currentStoreRef.current),
        };
        
        // Force context re-render (or set up proper subscription)
        // In practice, this would be done with useMemo/useReducer pattern
    };

    const getMutators = (current: Store): AppContext['mutators'] => {
        const baseMutators = {} as any;

        // Wrap mutators to persist state after each mutation
        ['addIncomeItem', 'addObligationItem', 'addExpenseItem'].forEach((action) => {
            const original = baseMutators[action] || ((payload: any) => {
                console.log(`${action} not yet defined`); // Placeholder
            });

            baseMutators[action] = (...args: any[]) => {
                result = original(...args);
                
                // Persist after mutation
                if (persistence.isInitialized && persistence.storage) {
                    persistence.save(currentStoreRef.current).catch(console.error);
                }
            };
        });

        return baseMutators;
    };

    const currentContextValue: AppContext = useMemo(() => ({
        store: defaultStore,
        mutators: {},
    }), []);

    return (
        <appContext.Provider value={currentContextValue}>
            {children}
        </appContext.Provider>
    );
};
```

#### Option B: Separate Store with Hooks (Recommended)

Create a separate module that exposes persisted data via hooks, keeping the Context logic clean.

```typescript
// hooks/useStorage.ts (NEW)

import { useState, useEffect } from 'react';
import { PersistenceService, PersistenceState } from '../persistence/service';
import { Store } from '../types';

export const useStorage = (initialStore?: Store): [Store, PersistenceState] => {
    const persistence = new PersistenceService();
    const [store, setStore] = useState<Store>(initialStore || defaultStore);
    const [isPersistent, setIsPersistent] = useState<boolean>(false);

    useEffect(() => {
        // Initialize and load persisted data
        persistence.initialize().then(async () => {
            const hydratedStore = await persistence.hydrate();
            
            if (hydratedStore) {
                setStore(hydratedStore);
                setIsPersistent(true);
            } else if (!initialStore) {
                // Load default if no persisted data
                setStore(defaultStore);
            }

            // Persist initial/default store
            await persistence.save(initialStore || defaultStore);
        }).catch(console.error);

        return () => {
            // Cleanup if needed
        };
    }, []);

    const updateStore = (newStore: Store) => {
        setStore(newStore);
        
        // Always persist after updates
        persistence.save(newStore).catch(console.error);
    };

    return [store, {
        isPersistent,
        hasData: async () => persistence.hasData(),
        clear: async () => persistence.clear(),
    } as PersistenceState];
};
```

---

## Implementation Roadmap

### Phase 1: Core Interface (Day 1-2)

1. Create `/store/persistence/types.ts` with `IStorageAdapter` interface
2. Implement `AsyncStorageAdapter` for React Native (iOS/Android)
3. Implement `SessionStorageAdapter` as web fallback

### Phase 2: Advanced Storage Backends (Day 3-4)

1. Implement `IndexedDBAdapter` for complex query needs
2. Implement optional SQL adapter (better long-term scalability)
3. Create registry pattern (`storage-registry.ts`)

### Phase 3: Integration Layer (Day 5-6)

1. Add persistence service wrapper
2. Modify existing context to integrate persistence (choose Option A or B)
3. Add migration layer for existing data structures

### Phase 4: Utilities & Testing (Day 7-8)

1. Create test helpers and mock adapters
2. Implement retry logic with backoff
3. Add validation to prevent corrupt storage writes
4. Write integration tests across platforms

---

## Key Features Summary

### ✅ Universal Support

- **iOS/Android**: AsyncStorage (built-on React Native SDK)
- **Web**: IndexedDB → Session Storage fallback
- **No external dependencies** except platform-native APIs

### ✅ Modular Design

- Each adapter is independent
- Swap implementations without changing business logic
- Easy to add new backends (e.g., Firestore, SQLite, Supabase)

### ✅ Lightweight

- No heavy framework dependencies
- AsyncStorage uses native async queues
- IndexedDB is web standard

### ✅ Safety Features

- **Graceful degradation**: Works even in crash/recovery scenarios
- **Retry logic**: Automatic retries with exponential backoff
- **Data validation**: Type-checks before persistence
- **Versioning**: App version baked into storage key (e.g., `budgetery_store_v1`)

### ✅ Performance Considerations

```typescript
// Batch operations for efficiency
export interface StorageOperation<T = unknown> {
    type: 'WRITE' | 'DELETE';
    value: T;
}

// For multiple small writes, batch them:
export async function batchSave(adapter: IStorageAdapter, operations: StorageOperation[]): Promise<void> {
    // Implement batching for large operation sets
    if (operations.length > 10) {
        const [criticalOps, bulkOps] = partitionByImportance(operations);
        
        // Write critical data immediately
        await adapter.save(criticalOps[0]);
        
        // Batch save the rest
        await adapter.transaction(operations.map(op => ({
            type: op.type,
            key: op.key,
            value: op.value,
        })));
    }
}
```

---

## Storage Key Convention

```
{appPrefix}_{storageVersion}_{dataName}_{identifier}?{encryptionOptional}

Example values:
budgetery_storage_v1_store_main
budgetery_storage_v1_user_data_{userId}
budgetery_cache_v1_session_{sessionId}
```

---

## Migration Strategy

When app version changes or schema changes, create a migration layer:

```typescript
// store/persistence/migration.ts (NEW)

export interface Migrations {
    [version: string]: (adapter: IStorageAdapter) => Promise<void>;
}

async function ensureMigration(adapter: IStorageAdapter): Promise<void> {
    const migrations = {
        'v2': async () => {
            // Add new fields to stored data structure
            // e.g., update all stores to add 'syncedAt' field
            await adapter.transaction(operations);
        },
        // ... more migrations
    };

    const currentVersion = await getStorageVersion(adapter);
    
    for (const [version, migrationFn] of Object.entries(migrations)) {
        if (semver.gte(version, currentVersion)) {
            await migrationFn.call({ version });
            await setStorageVersion(adapter, version);
        }
    }
}
```

---

## Testing Checklist

- [ ] AsyncStorage works on iOS simulator
- [ ] AsyncStorage works on Android emulator
- [ ] IndexedDB works in Chrome/Safari/Firefox
- [ ] Session storage as web fallback works correctly
- [ ] Persistence survives app restart (kill and relaunch)
- [ ] Offline mode: mutations persist, resume after network returns
- [ ] Data validation prevents storing invalid state
- [ ] Migration layer runs without data loss

---

## Future Extensibility

### Planned Enhancements

1. **Offline-first sync**: Persist locally, sync when online
2. **Data export/import**: Store as JSON for backup
3. **Encrypted storage**: Optional encryption toggle in `IStorageAdapter`
4. **Multi-user support**: Separate stores per user/profile
5. **Analytics-ready adapter wrapper**: Track storage performance metrics

---

## Conclusion

This design provides a clean, modular abstraction that:

1. Hides platform differences behind a single interface (`IStorageAdapter`)
2. Lets the app work seamlessly across iOS, Android, and Web
3. Is easy to extend when new backends become desirable
4. Maintains separation of concerns between state logic and persistence logic

The solution prioritizes **graceful degradation** (continues working without persistence), **simplicity** (native APIs, no heavy dependencies), and **extensibility** (interface-driven design allows adding new storage options without touching existing business logic).
