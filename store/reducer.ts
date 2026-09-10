import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";
import { Action, CurrentPeriod, IncomeItem, ExpenseItem, isCurrentPeriodPassed, isIncomeItemPassed, isObligationItemPassed, ObligationItem, PeriodRecord, Store, isExpenseItemPassed, IndexedItemUpdate } from "./types";

export function periodIdFor(store: Store): string | null {
    return store.currentPeriodId ?? null;
}

/** Items visible in the active period. Legacy items without periodId are treated as current. */
export function visibleIncome(store: Store): IncomeItem[] {
    const pid = periodIdFor(store);
    if (!pid) return store.incomeItems;
    return store.incomeItems.filter((i) => !i.periodId || i.periodId === pid);
}

export function visibleObligations(store: Store): ObligationItem[] {
    const pid = periodIdFor(store);
    if (!pid) return store.obligationItems;
    return store.obligationItems.filter((i) => !i.periodId || i.periodId === pid);
}

export function visibleExpenses(store: Store): ExpenseItem[] {
    const pid = periodIdFor(store);
    if (!pid) return store.expenseItems;
    return store.expenseItems.filter((i) => !i.periodId || i.periodId === pid);
}

/** Map an index within the visible (filtered) list back to the full store array index. */
export function visibleIndexToStoreIndex<T extends { periodId?: string }>(full: T[], visible: T[], visibleIndex: number): number {
    const item = visible[visibleIndex];
    if (!item) return -1;
    return full.indexOf(item);
}

function stampPeriod<T extends { periodId?: string }>(store: Store, item: T): T {
    const pid = periodIdFor(store);
    if (!pid || item.periodId) return item;
    return { ...item, periodId: pid };
}

export function remainsReducer(store: Store): Store {
    const { remainingBudget, totalExpenses } = store;
    return {
        ...store,
        remains: remainingBudget - totalExpenses,
    }
}

export function daylyBudgetReducer(store: Store): Store {
    const month = store.currentPeriod.month;
    const targetDate = new Date(new Date().getFullYear(), month, 0);
    const daysInPeriod = targetDate.getDate() || 30;
    const { remainingBudget } = store;
    return {
        ...store,
        daylyBudget: remainingBudget / daysInPeriod,

    }
}

export function currentPeriodReducer(store: Store, payload: CurrentPeriod): Store {
    return {
        ...store,
        currentPeriod: payload,
    }
}
export function remainingBudgetReducer(store: Store): Store {
    const { totalBudget, totalObligations } = store;
    return {
        ...store,
        remainingBudget: totalBudget - totalObligations,
    };
}

export function totalPercentageObligationsReducer(store: Store): Store {
    const { totalBudget } = store;
    const items = visibleObligations(store);
    const percentageObligations = items.reduce((acc, current) => current.isPercentage ? acc + current.amount : acc, 0);
    const percentageApplied = totalBudget * (percentageObligations / 100);
    return {
        ...store,
        totalPercentageObligations: percentageApplied,
    }
};
export function totalObligationsReducer(store: Store): Store {
    const { totalPercentageObligations } = store;
    const items = visibleObligations(store);
    const obligationsPlainSum = items.reduce((acc, current) => !current.isPercentage ? acc + current.amount : acc, 0);
    const totalObligationsApplied = obligationsPlainSum + totalPercentageObligations;
    return {
        ...store,
        totalObligations: totalObligationsApplied,
    }
};

export function totalBudgetReducer(store: Store): Store {
    const items = visibleIncome(store);
    const incomeAmount = items.reduce((acc, current) => acc + current.amount, 0);
    return {
        ...store,
        totalBudget: incomeAmount,
    }
};

/** Recompute every derived total from the visible (active period) items. */
export function recomputeDerived(store: Store): Store {
    return remainsReducer(
        daylyBudgetReducer(
            remainingBudgetReducer(
                totalObligationsReducer(
                    totalPercentageObligationsReducer(
                        totalExpensesReducer(
                            totalBudgetReducer(store)
                        )
                    )
                )
            )
        )
    );
}

function addIncomeItemReducer(store: Store, payload: IncomeItem): Store {
    const incomeAddedStore = {
        ...store,
        incomeItems: [...store.incomeItems, stampPeriod(store, payload)],
    };

    // Derived budget model: totalBudget = Σ income. Adding income changes
    // remainingBudget, so remains (remaining − totalExpenses) must recompute too.
    return recomputeDerived(incomeAddedStore);
}

function addObligationItemReducer(store: Store, payload: ObligationItem): Store {
    const obligationAddedStore = {
        ...store,
        obligationItems: [...store.obligationItems, stampPeriod(store, payload)],
    };
    return recomputeDerived(obligationAddedStore);
}

export function totalExpensesReducer(store: Store): Store {
    const items = visibleExpenses(store);
    const totalExpensesApplied = items.reduce((acc, current) => acc + current.amount, 0);
    return {
        ...store,
        totalExpenses: totalExpensesApplied,
    }
};

function addExpenseItemReducer(store: Store, payload: ExpenseItem): Store {
    const expenseAdded = {
        ...store,
        expenseItems: [...store.expenseItems, stampPeriod(store, payload)],
    }
    return recomputeDerived(expenseAdded);
}

function addExpenseItemsReducer(store: Store, payload: ExpenseItem[]): Store {
    const expenseAdded = {
        ...store,
        expenseItems: [...store.expenseItems, ...payload.map((i) => stampPeriod(store, i))],
    }
    return recomputeDerived(expenseAdded);
}

function replaceAt<T>(arr: T[], index: number, item: T): T[] {
    if (index < 0 || index >= arr.length) return arr;
    const next = [...arr];
    next[index] = item;
    return next;
}

function removeAt<T>(arr: T[], index: number): T[] {
    if (index < 0 || index >= arr.length) return arr;
    return [...arr.slice(0, index), ...arr.slice(index + 1)];
}

export function makePeriodRecord(period: CurrentPeriod, year?: number): PeriodRecord {
    const y = year ?? new Date().getFullYear();
    return {
        id: `${y}-${period.month}-${period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name: period.name,
        month: period.month,
        year: y,
    };
}

function selectPeriodReducer(store: Store, id: string): Store {
    const record = store.periods.find((p) => p.id === id);
    if (!record) return store;
    const switched: Store = {
        ...store,
        currentPeriodId: record.id,
        currentPeriod: { name: record.name, month: record.month },
    };
    return recomputeDerived(switched);
}

function startNewMonthReducer(store: Store, payload: CurrentPeriod): Store {
    const record = makePeriodRecord(payload);
    // Carry recurring obligations into the new month as fresh items.
    const carried: ObligationItem[] = visibleObligations(store)
        .filter((o) => o.isRecurring === true)
        .map((o) => ({ ...o, date: new Date(), periodId: record.id }));
    const next: Store = {
        ...store,
        periods: [...store.periods, record],
        currentPeriodId: record.id,
        currentPeriod: payload,
        obligationItems: [...store.obligationItems, ...carried],
        // Re-showing tutorial: tab tutorials reset, welcome stays passed.
        incomeTutorialPassed: false,
        obligationsTutorialPassed: false,
        expensesTutorialPassed: false,
    };
    return recomputeDerived(next);
}



export function appReducer(store: Store, action: Action): Store {
    const { payload } = action;
    switch (action.type) {
        case ACTION_TYPES.LOAD_STORE:
            if (payload && typeof payload === 'object' && 'incomeItems' in (payload as Store)) {
                return recomputeDerived(payload as Store);
            }
            break;
        case ACTION_TYPES.PASS_TUTORIAL:
            if (payload === null || payload === undefined) break;
            switch (payload) {
                case TUTORIAL_NAMES.income:
                    return { ...store, incomeTutorialPassed: true };
                case TUTORIAL_NAMES.obligations:
                    return { ...store, obligationsTutorialPassed: true };
                case TUTORIAL_NAMES.expenses:
                    return { ...store, expensesTutorialPassed: true };
                case TUTORIAL_NAMES.welcome:
                    return { ...store, welcomeTutorialPassed: true };
            }
            break;
        case ACTION_TYPES.ADD_PERIOD:
            if (isCurrentPeriodPassed(payload)) {
                return currentPeriodReducer(store, payload);
            }
            break;
        case ACTION_TYPES.SELECT_PERIOD:
            if (typeof payload === 'string') {
                return selectPeriodReducer(store, payload);
            }
            break;
        case ACTION_TYPES.START_NEW_MONTH:
            if (isCurrentPeriodPassed(payload)) {
                return startNewMonthReducer(store, payload);
            }
            break;
        case ACTION_TYPES.ADD_INCOME:
            if (isIncomeItemPassed(payload)) {
                return addIncomeItemReducer(store, payload);
            }
            if (Array.isArray(payload) && payload.every(isIncomeItemPassed)) {
                let next = store;
                for (const item of payload as IncomeItem[]) {
                    next = addIncomeItemReducer(next, item);
                }
                return next;
            }
            break;
        case ACTION_TYPES.UPDATE_INCOME: {
            const p = payload as IndexedItemUpdate<IncomeItem>;
            if (p && typeof p.index === 'number' && isIncomeItemPassed(p.item)) {
                const visible = visibleIncome(store);
                const storeIndex = visibleIndexToStoreIndex(store.incomeItems, visible, p.index);
                if (storeIndex < 0) break;
                const stamped = stampPeriod(store, p.item);
                // Preserve original periodId when editing within the same period.
                const original = store.incomeItems[storeIndex];
                const merged = { ...stamped, periodId: original.periodId ?? stamped.periodId };
                return recomputeDerived({ ...store, incomeItems: replaceAt(store.incomeItems, storeIndex, merged) });
            }
            break;
        }
        case ACTION_TYPES.REMOVE_INCOME:
            if (typeof payload === 'number') {
                const visible = visibleIncome(store);
                const storeIndex = visibleIndexToStoreIndex(store.incomeItems, visible, payload);
                if (storeIndex < 0) break;
                return recomputeDerived({ ...store, incomeItems: removeAt(store.incomeItems, storeIndex) });
            }
            break;
        case ACTION_TYPES.ADD_OBLIGATION:
            if (isObligationItemPassed(payload)) {
                return addObligationItemReducer(store, payload);
            }
            break;
        case ACTION_TYPES.UPDATE_OBLIGATION: {
            const p = payload as IndexedItemUpdate<ObligationItem>;
            if (p && typeof p.index === 'number' && isObligationItemPassed(p.item)) {
                const visible = visibleObligations(store);
                const storeIndex = visibleIndexToStoreIndex(store.obligationItems, visible, p.index);
                if (storeIndex < 0) break;
                const stamped = stampPeriod(store, p.item);
                const original = store.obligationItems[storeIndex];
                const merged = { ...stamped, periodId: original.periodId ?? stamped.periodId };
                return recomputeDerived({ ...store, obligationItems: replaceAt(store.obligationItems, storeIndex, merged) });
            }
            break;
        }
        case ACTION_TYPES.REMOVE_OBLIGATION:
            if (typeof payload === 'number') {
                const visible = visibleObligations(store);
                const storeIndex = visibleIndexToStoreIndex(store.obligationItems, visible, payload);
                if (storeIndex < 0) break;
                return recomputeDerived({ ...store, obligationItems: removeAt(store.obligationItems, storeIndex) });
            }
            break;
        case ACTION_TYPES.ADD_EXPENSE:
            if (isExpenseItemPassed(payload)) {
                return addExpenseItemReducer(store, payload);
            }
            if (Array.isArray(payload) && payload.every(isExpenseItemPassed)) {
                return addExpenseItemsReducer(store, payload as ExpenseItem[]);
            }
            break;
        case ACTION_TYPES.UPDATE_EXPENSE: {
            const p = payload as IndexedItemUpdate<ExpenseItem>;
            if (p && typeof p.index === 'number' && isExpenseItemPassed(p.item)) {
                const visible = visibleExpenses(store);
                const storeIndex = visibleIndexToStoreIndex(store.expenseItems, visible, p.index);
                if (storeIndex < 0) break;
                const stamped = stampPeriod(store, p.item);
                const original = store.expenseItems[storeIndex];
                const merged = { ...stamped, periodId: original.periodId ?? stamped.periodId };
                return recomputeDerived({ ...store, expenseItems: replaceAt(store.expenseItems, storeIndex, merged) });
            }
            break;
        }
        case ACTION_TYPES.REMOVE_EXPENSE:
            if (typeof payload === 'number') {
                const visible = visibleExpenses(store);
                const storeIndex = visibleIndexToStoreIndex(store.expenseItems, visible, payload);
                if (storeIndex < 0) break;
                return recomputeDerived({ ...store, expenseItems: removeAt(store.expenseItems, storeIndex) });
            }
            break;
        default:
            break
    }
    return store;
};
