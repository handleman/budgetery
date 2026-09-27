import {
    BACKUP_NAME,
    BUDGETERY_FOLDER,
    DriveError,
    downloadBackup,
    ensureBudgeteryFolder,
    FetchFn,
    findBackupFile,
    writeBackup,
} from './driveClient';

type LoggedCall = { url: string; method: string; body?: string };

/** Queue-based fetch stub: pops one canned JSON body per call, logs requests. */
function queueFetch(bodies: unknown[], log: LoggedCall[], status = 200): FetchFn {
    return (async (input: string, init?: RequestInit) => {
        log.push({ url: input, method: init?.method ?? 'GET', body: typeof init?.body === 'string' ? init.body : undefined });
        const body = bodies.shift();
        return {
            ok: status >= 200 && status < 300,
            status,
            json: async () => body,
            text: async () => JSON.stringify(body),
        };
    }) as FetchFn;
}

describe('ensureBudgeteryFolder', () => {
    it('returns the existing folder id without creating', async () => {
        const log: LoggedCall[] = [];
        const id = await ensureBudgeteryFolder(queueFetch([{ files: [{ id: 'folder-1' }] }], log), 'tok');
        expect(id).toBe('folder-1');
        expect(log).toHaveLength(1);
        expect(log[0].url).toContain('Budgetery');
    });

    it('creates the folder when absent', async () => {
        const log: LoggedCall[] = [];
        const id = await ensureBudgeteryFolder(
            queueFetch([{ files: [] }, { id: 'folder-2' }], log),
            'tok',
        );
        expect(id).toBe('folder-2');
        expect(log[1].method).toBe('POST');
        expect(log[1].body).toContain(BUDGETERY_FOLDER);
    });
});

describe('findBackupFile', () => {
    it('returns null when no backup exists', async () => {
        const meta = await findBackupFile(queueFetch([{ files: [] }], []), 'tok', 'folder-1');
        expect(meta).toBeNull();
    });

    it('returns id + modifiedTime when present', async () => {
        const meta = await findBackupFile(
            queueFetch([{ files: [{ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }] }], []),
            'tok',
            'folder-1',
        );
        expect(meta).toEqual({ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' });
    });
});

describe('writeBackup', () => {
    it('creates with POST including the folder parent', async () => {
        const log: LoggedCall[] = [];
        const res = await writeBackup(
            queueFetch([{ id: 'file-9', modifiedTime: '2026-09-27T10:00:00.000Z' }], log),
            'tok',
            'folder-1',
            null,
            '{"a":1}',
        );
        expect(res.id).toBe('file-9');
        expect(log[0].method).toBe('POST');
        expect(log[0].body).toContain('folder-1');
        expect(log[0].body).toContain(BACKUP_NAME);
    });

    it('updates with PATCH on the file id', async () => {
        const log: LoggedCall[] = [];
        await writeBackup(
            queueFetch([{ id: 'file-1', modifiedTime: '2026-09-27T11:00:00.000Z' }], log),
            'tok',
            'folder-1',
            'file-1',
            '{"a":2}',
        );
        expect(log[0].method).toBe('PATCH');
        expect(log[0].url).toContain('file-1');
    });
});

describe('errors', () => {
    it('throws DriveError with status on auth failure', async () => {
        const failing: FetchFn = (async () => ({
            ok: false,
            status: 401,
            json: async () => ({}),
            text: async () => 'Unauthorized',
        })) as FetchFn;
        await expect(downloadBackup(failing, 'bad', 'file-1')).rejects.toMatchObject({
            status: 401,
        });
        await expect(downloadBackup(failing, 'bad', 'file-1')).rejects.toBeInstanceOf(DriveError);
    });
});
