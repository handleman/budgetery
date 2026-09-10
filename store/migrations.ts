import { CurrentPeriod, PeriodRecord, Store } from './types';
import { makePeriodRecord } from './reducer';

export type migrationVersion = 2;
export const CURRENT_MIGRATION_VERSION: migrationVersion = 2 as migrationVersion;

export async function applyMigrations(store: Partial<Store>): Promise<Partial<Store>> {
    const next: Partial<Store> & Record<string, unknown> = { ...(store as Record<string, unknown>) };

    // v1 → v2: per-period isolation. Backfill periods[] + currentPeriodId and
    // stamp legacy items (no periodId) to the active period.
    if (!Array.isArray(next['periods']) || typeof next['currentPeriodId'] === 'undefined') {
        const current = (next['currentPeriod'] as CurrentPeriod | undefined) ?? { name: '', month: 0 };
        let record: PeriodRecord | null = null;
        if (current.name && current.month >= 1 && current.month <= 12) {
            record = makePeriodRecord(current);
        }
        next['periods'] = Array.isArray(next['periods']) ? next['periods'] : (record ? [record] : []);
        if (typeof next['currentPeriodId'] === 'undefined') {
            next['currentPeriodId'] = record ? record.id : null;
        }
        const pid = next['currentPeriodId'] as string | null;
        if (typeof pid === 'string' && pid) {
            for (const key of ['incomeItems', 'obligationItems', 'expenseItems'] as const) {
                const items = next[key] as { periodId?: string }[] | undefined;
                if (Array.isArray(items)) {
                    next[key] = items.map((item) =>
                        item && !item.periodId ? { ...item, periodId: pid } : item,
                    ) as never;
                }
            }
        }
    }

    // Ensure new boolean/flag defaults exist.
    if (!Array.isArray(next['periods'])) next['periods'] = [] as never;
    if (typeof next['currentPeriodId'] === 'undefined') next['currentPeriodId'] = null as never;

    return next;
}
