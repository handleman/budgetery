import { Store } from '../types';
import { defaultSyncConfig, defaultSyncStatus } from './types';
import { FetchFn } from './driveClient';
import { ENVELOPE_FORMAT, isBackupEnvelope, pullStore, pushStore, syncNow } from './syncService';

function stubStore(overrides: Partial<Store> = {}): Store {
    return {
        incomeTutorialPassed: true,
        obligationsTutorialPassed: true,
        expensesTutorialPassed: true,
        welcomeTutorialPassed: true,
        currentPeriod: { name: 'September', month: 9 },
        periods: [],
        currentPeriodId: null,
        incomeItems: [],
        obligationItems: [],
        expenseItems: [],
        totalBudget: 0,
        totalPercentageObligations: 0,
        totalObligations: 0,
        totalExpenses: 0,
        remainingBudget: 0,
        daylyBudget: 0,
        remains: 0,
        syncConfig: { ...defaultSyncConfig },
        syncStatus: { ...defaultSyncStatus },
        ...overrides,
    };
}

function queueFetch(bodies: unknown[]): FetchFn {
    return (async (input: string, init?: RequestInit) => {
        void input;
        void init;
        const body = bodies.shift();
        return {
            ok: true,
            status: 200,
            json: async () => body,
            text: async () => JSON.stringify(body),
        };
    }) as FetchFn;
}

describe('isBackupEnvelope', () => {
    it('rejects garbage', () => {
        expect(isBackupEnvelope(null)).toBe(false);
        expect(isBackupEnvelope({ format: 'other/1' })).toBe(false);
    });

    it('accepts the current format', () => {
        expect(
            isBackupEnvelope({ format: ENVELOPE_FORMAT, revision: 1, updatedAt: 't', store: {} }),
        ).toBe(true);
    });
});

describe('pushStore', () => {
    it('creates the backup and bumps revision', async () => {
        const res = await pushStore(
            stubStore(),
            'tok',
            queueFetch([
                { files: [{ id: 'folder-1' }] }, // ensure folder
                { files: [] }, // no backup yet
                { id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }, // write
            ]),
        );
        expect(res.revision).toBe(1);
        expect(typeof res.updatedAt).toBe('string');
    });
});

describe('pullStore', () => {
    it('returns null when no backup exists', async () => {
        const res = await pullStore(
            'tok',
            queueFetch([{ files: [{ id: 'folder-1' }] }, { files: [] }]),
        );
        expect(res).toBeNull();
    });

    it('restores the store from a valid envelope', async () => {
        const res = await pullStore(
            'tok',
            queueFetch([
                { files: [{ id: 'folder-1' }] },
                { files: [{ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }] },
                {
                    format: ENVELOPE_FORMAT,
                    revision: 3,
                    updatedAt: '2026-09-27T10:00:00.000Z',
                    store: { totalBudget: 5000 },
                },
            ]),
        );
        expect(res?.revision).toBe(3);
        expect(res?.store.totalBudget).toBe(5000);
    });

    it('rejects unknown envelope formats', async () => {
        await expect(
            pullStore(
                'tok',
                queueFetch([
                    { files: [{ id: 'folder-1' }] },
                    { files: [{ id: 'file-1', modifiedTime: 't' }] },
                    { format: 'other/9', store: {} },
                ]),
            ),
        ).rejects.toThrow('unknown format');
    });
});

describe('syncNow', () => {
    it('pushes when nothing is remote', async () => {
        const res = await syncNow(
            stubStore(),
            'tok',
            queueFetch([
                { files: [{ id: 'folder-1' }] }, // syncNow ensure
                { files: [] }, // syncNow find
                { files: [{ id: 'folder-1' }] }, // pushStore ensure
                { files: [] }, // pushStore find
                { id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' },
            ]),
        );
        expect(res.direction).toBe('push');
    });

    it('pulls when remote is newer than last sync', async () => {
        const store = stubStore({
            syncStatus: { ...defaultSyncStatus, lastSync: '2026-09-20T10:00:00.000Z' },
        });
        const res = await syncNow(
            store,
            'tok',
            queueFetch([
                { files: [{ id: 'folder-1' }] },
                { files: [{ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }] },
                {
                    format: ENVELOPE_FORMAT,
                    revision: 2,
                    updatedAt: '2026-09-27T10:00:00.000Z',
                    store: { totalBudget: 7000 },
                },
            ]),
        );
        expect(res.direction).toBe('pull');
        if (res.direction === 'pull') {
            expect(res.store.totalBudget).toBe(7000);
        }
    });

    it('pushes when local sync is newer than remote', async () => {
        const store = stubStore({
            syncStatus: { ...defaultSyncStatus, lastSync: '2026-09-28T10:00:00.000Z' },
        });
        const res = await syncNow(
            store,
            'tok',
            queueFetch([
                { files: [{ id: 'folder-1' }] }, // syncNow ensure
                { files: [{ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }] }, // older
                { files: [{ id: 'folder-1' }] }, // pushStore ensure
                { files: [{ id: 'file-1', modifiedTime: '2026-09-27T10:00:00.000Z' }] },
                { id: 'file-1', modifiedTime: '2026-09-28T10:00:00.000Z' },
            ]),
        );
        expect(res.direction).toBe('push');
    });
});
