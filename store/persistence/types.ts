import { Store } from '../types';

export interface IStorageAdapter {
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    
    transaction<T>(operations: StorageOperation[]): Promise<T>;
}

export interface StorageOperation<T = unknown> {
    type: 'WRITE' | 'DELETE';
    key: string;
    value?: T;
}
