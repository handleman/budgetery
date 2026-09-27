/**
 * Minimal Google Drive v3 REST client (fetch with bearer token, no SDK).
 * Fixed default folder: app-created `Budgetery`, single `budgetery-backup.json`.
 * No folder picker (dropped from plans) — see GOOGLE_DRIVE_SYNC_DESIGN.md.
 */

export type FetchFn = (
    input: string,
    init?: RequestInit,
) => Promise<{ ok: boolean; status: number; json(): Promise<unknown>; text(): Promise<string> }>;

export class DriveError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export const BUDGETERY_FOLDER = 'Budgetery';
export const BACKUP_NAME = 'budgetery-backup.json';

const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

type DriveFile = { id: string; name?: string; modifiedTime?: string };

async function authedJson(fetchFn: FetchFn, token: string, url: string, init?: RequestInit): Promise<any> {
    const res = await fetchFn(url, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
    });
    if (!res.ok) {
        let detail = '';
        try {
            detail = await res.text();
        } catch {
            detail = '';
        }
        throw new DriveError(res.status, `Drive request failed (${res.status}): ${detail.slice(0, 200)}`);
    }
    return res.json();
}

function listUrl(query: string): string {
    const params = new URLSearchParams({
        q: query,
        fields: 'files(id,name,modifiedTime)',
        pageSize: '10',
    });
    return `${FILES_URL}?${params.toString()}`;
}

/** Find-or-create the default `Budgetery` folder; returns its id. */
export async function ensureBudgeteryFolder(fetchFn: FetchFn, token: string): Promise<string> {
    const found = (await authedJson(
        fetchFn,
        token,
        listUrl(`mimeType = 'application/vnd.google-apps.folder' and name = '${BUDGETERY_FOLDER}' and trashed = false`),
    )) as { files?: DriveFile[] };
    const existing = found.files?.[0]?.id;
    if (existing) return existing;
    const created = (await authedJson(fetchFn, token, FILES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: BUDGETERY_FOLDER, mimeType: 'application/vnd.google-apps.folder' }),
    })) as DriveFile;
    if (!created.id) throw new DriveError(0, 'Drive folder creation returned no id.');
    return created.id;
}

/** Metadata of the backup file in the default folder, or null when absent. */
export async function findBackupFile(
    fetchFn: FetchFn,
    token: string,
    folderId: string,
): Promise<{ id: string; modifiedTime: string } | null> {
    const found = (await authedJson(
        fetchFn,
        token,
        listUrl(`'${folderId}' in parents and name = '${BACKUP_NAME}' and trashed = false`),
    )) as { files?: DriveFile[] };
    const file = found.files?.[0];
    if (!file?.id) return null;
    return { id: file.id, modifiedTime: file.modifiedTime ?? '' };
}

/** Download + parse the backup file. */
export async function downloadBackup(fetchFn: FetchFn, token: string, fileId: string): Promise<any> {
    return authedJson(fetchFn, token, `${FILES_URL}/${fileId}?alt=media`);
}

/** Create (no fileId) or update the backup file; returns its id + modifiedTime. */
export async function writeBackup(
    fetchFn: FetchFn,
    token: string,
    folderId: string,
    fileId: string | null,
    payload: string,
): Promise<{ id: string; modifiedTime: string }> {
    const boundary = `budgetery-${Date.now()}`;
    const metadata = fileId ? { name: BACKUP_NAME } : { name: BACKUP_NAME, parents: [folderId] };
    const body =
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
        `${payload}\r\n` +
        `--${boundary}--`;
    const url = fileId ? `${FILES_URL}/${fileId}?uploadType=multipart` : UPLOAD_URL;
    const written = (await authedJson(fetchFn, token, url, {
        method: fileId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
        body,
    })) as DriveFile;
    if (!written.id) throw new DriveError(0, 'Drive write returned no file id.');
    return { id: written.id, modifiedTime: written.modifiedTime ?? '' };
}
