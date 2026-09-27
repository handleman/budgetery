import { Store } from '../types';
import { cleanStoreForStorage, preparePulledStore } from '../persistence/service';
import {
    downloadBackup,
    ensureBudgeteryFolder,
    FetchFn,
    findBackupFile,
    writeBackup,
} from './driveClient';

/**
 * Minimal Drive sync against the fixed default folder (no picker).
 * Direction: remote newer than our last sync (or never synced) → pull wins,
 * else push. Last-write-wins, no conflict backups (kept minimal by design).
 */

export const ENVELOPE_FORMAT = 'budgetery-backup/1';

export type BackupEnvelope = {
    format: string;
    revision: number;
    updatedAt: string;
    store: unknown;
};

export type SyncDirection = 'push' | 'pull';

export type PushResult = { direction: 'push'; revision: number; updatedAt: string };
export type PullResult = {
    direction: 'pull';
    store: Store;
    revision: number;
    updatedAt: string;
};
export type SyncNowResult = PushResult | PullResult;

const defaultFetch: FetchFn = (input, init) => fetch(input, init);

export function isBackupEnvelope(value: unknown): value is BackupEnvelope {
    return (
        !!value &&
        typeof value === 'object' &&
        (value as BackupEnvelope).format === ENVELOPE_FORMAT &&
        typeof (value as BackupEnvelope).revision === 'number' &&
        typeof (value as BackupEnvelope).updatedAt === 'string' &&
        !!(value as BackupEnvelope).store
    );
}

/** Serialize + upload the local store; returns the new revision stamp. */
export async function pushStore(
    store: Store,
    token: string,
    fetchFn: FetchFn = defaultFetch,
): Promise<{ revision: number; updatedAt: string }> {
    const folderId = await ensureBudgeteryFolder(fetchFn, token);
    const existing = await findBackupFile(fetchFn, token, folderId);
    const revision = (store.syncConfig?.revision ?? 0) + 1;
    const updatedAt = new Date().toISOString();
    const envelope: BackupEnvelope = {
        format: ENVELOPE_FORMAT,
        revision,
        updatedAt,
        store: cleanStoreForStorage(store),
    };
    await writeBackup(fetchFn, token, folderId, existing?.id ?? null, JSON.stringify(envelope));
    return { revision, updatedAt };
}

/** Download the backup, or null when no backup exists yet. */
export async function pullStore(
    token: string,
    fetchFn: FetchFn = defaultFetch,
): Promise<{ store: Store; revision: number; updatedAt: string } | null> {
    const folderId = await ensureBudgeteryFolder(fetchFn, token);
    const meta = await findBackupFile(fetchFn, token, folderId);
    if (!meta) return null;
    const raw = await downloadBackup(fetchFn, token, meta.id);
    if (!isBackupEnvelope(raw)) {
        throw new Error('Drive backup has an unknown format.');
    }
    const store = await preparePulledStore(raw.store);
    return { store, revision: raw.revision, updatedAt: raw.updatedAt };
}

/** One manual sync: pull when remote is newer, else push. */
export async function syncNow(
    store: Store,
    token: string,
    fetchFn: FetchFn = defaultFetch,
): Promise<SyncNowResult> {
    const folderId = await ensureBudgeteryFolder(fetchFn, token);
    const meta = await findBackupFile(fetchFn, token, folderId);
    const lastSync = store.syncStatus?.lastSync ?? null;
    if (meta && (!lastSync || (meta.modifiedTime && meta.modifiedTime > lastSync))) {
        const raw = await downloadBackup(fetchFn, token, meta.id);
        if (!isBackupEnvelope(raw)) {
            throw new Error('Drive backup has an unknown format.');
        }
        const restored = await preparePulledStore(raw.store);
        return { direction: 'pull', store: restored, revision: raw.revision, updatedAt: raw.updatedAt };
    }
    const pushed = await pushStore(store, token, fetchFn);
    return { direction: 'push', ...pushed };
}
