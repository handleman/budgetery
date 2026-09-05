import { Store } from '../types';

export interface IPersistenceManager {
    initialize(): Promise<void>;
    
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    hasData(): Promise<boolean>;
}
