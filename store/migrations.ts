import { Store } from '../types';

export type migrationVersion = 1;
export const CURRENT_MIGRATION_VERSION: migrationVersion = 1 as migrationVersion;

export async function applyMigrations(store: Partial<Store>): Promise<Partial<Store>> {
    // Version 1: No changes needed yet
    
    return store;
}
