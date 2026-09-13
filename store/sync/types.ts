/** Google Drive sync configuration + status (M1/M2: config shell + auth; folder/sync in M3/M4). */

export type SyncConfig = {
    /** Drive folder id chosen by the user (M3). */
    folderId: string | null;
    folderName: string | null;
    autoSync: boolean;
    /** Monotonic counter bumped on every push (M4 conflict detection). */
    revision: number;
};

export type SyncStatus = {
    connected: boolean;
    /** Google account email, null when disconnected. */
    email: string | null;
    /** ISO timestamp of the last successful sync, null when never synced. */
    lastSync: string | null;
    lastError: string | null;
};

export const defaultSyncConfig: SyncConfig = {
    folderId: null,
    folderName: null,
    autoSync: true,
    revision: 0,
};

export const defaultSyncStatus: SyncStatus = {
    connected: false,
    email: null,
    lastSync: null,
    lastError: null,
};

export function isSyncConfig(value: any): value is SyncConfig {
    return (
        !!value &&
        typeof value === 'object' &&
        (value.folderId === null || typeof value.folderId === 'string') &&
        (value.folderName === null || typeof value.folderName === 'string') &&
        typeof value.autoSync === 'boolean' &&
        typeof value.revision === 'number'
    );
}

export function isSyncStatus(value: any): value is SyncStatus {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof value.connected === 'boolean' &&
        (value.email === null || typeof value.email === 'string') &&
        (value.lastSync === null || typeof value.lastSync === 'string') &&
        (value.lastError === null || typeof value.lastError === 'string')
    );
}
