import { Store } from '../types';

export interface IStorageAdapter {
    load(): Promise<Store | null>;
    save(store: Store): Promise<void>;
    clear(): Promise<void>;
    init?(): Promise<void>;
    
    transaction<T>(operations: StorageOperation[]): Promise<T | void>;
}

export interface StorageOperation<T = unknown> {
    type: 'WRITE' | 'DELETE';
    key: string;
    value?: T;
}
