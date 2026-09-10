import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";

export type CurrentPeriod = {
    name: string;
    month: number;
}

export type PeriodRecord = {
    id: string;
    name: string;
    month: number;
    year: number;
}

export type IncomeItem = {
    date: Date;
    amount: number;
    label: string;
    periodId?: string;
}

export type ObligationItem = {
    date: Date;
    amount: number;
    label: string;
    isPercentage: boolean;
    isRecurring?: boolean;
    periodId?: string;
}

// could differ from incomeItem in the future
export type ExpenseItem = {
    date: Date;
    amount: number;
    label: string;
    periodId?: string;
}

function isValidDate(value: any): boolean {
    return value instanceof Date && !Number.isNaN(value.getTime());
}

function isValidAmount(value: any): boolean {
    return typeof value === 'number' && Number.isFinite(value);
}

function isValidLabel(value: any): boolean {
    return typeof value === 'string' && value.trim() !== '';
}

export function isIncomeItemPassed(value: any): value is IncomeItem {
    const isDateDefined = isValidDate(value?.date);
    const isAmountDefined = isValidAmount(value?.amount);
    const isLabelDefined = isValidLabel(value?.label);
    return isDateDefined && isAmountDefined && isLabelDefined;
}

export function isExpenseItemPassed(value: any): value is ExpenseItem {
    const isDateDefined = isValidDate(value?.date);
    const isAmountDefined = isValidAmount(value?.amount);
    const isLabelDefined = isValidLabel(value?.label);
    return isDateDefined && isAmountDefined && isLabelDefined;
}

// may differ from isIncomeItemPassed in future
export function isObligationItemPassed(value: any): value is ObligationItem {
    const isDateDefined = isValidDate(value?.date);
    const isAmountDefined = isValidAmount(value?.amount);
    const isLabelDefined = isValidLabel(value?.label);
    const isPercentageDefined = typeof value?.isPercentage === 'boolean';
    return isDateDefined && isAmountDefined && isLabelDefined && isPercentageDefined;
}

export function isPeriodRecordPassed(value: any): value is PeriodRecord {
    return typeof value?.id === 'string' && value.id !== ''
        && isValidLabel(value?.name)
        && typeof value?.month === 'number' && Number.isInteger(value.month)
        && value.month >= 1 && value.month <= 12
        && typeof value?.year === 'number' && Number.isInteger(value.year);
}

export function isCurrentPeriodPassed(value: any): value is CurrentPeriod {
    const isNameDefined = isValidLabel(value?.name);
    const isMonthDefined = typeof value?.month === 'number'
        && Number.isInteger(value.month)
        && value.month >= 1 && value.month <= 12;
    return isNameDefined && isMonthDefined;
}

export type Store = {
    incomeTutorialPassed: boolean;
    obligationsTutorialPassed: boolean;
    expensesTutorialPassed: boolean;
    welcomeTutorialPassed: boolean;
    currentPeriod: CurrentPeriod
    periods: PeriodRecord[];
    currentPeriodId: string | null;
    incomeItems: IncomeItem[];
    obligationItems: ObligationItem[];
    expenseItems: ExpenseItem[];
    totalBudget: number;
    totalPercentageObligations: number;
    totalObligations: number;
    totalExpenses: number;
    remainingBudget: number;
    daylyBudget: number;
    remains: number;
};

export type AppContext = {
    store: Store;
    mutators: {
        passIncomeTutorial: () => void;
        passObligationsTutorial: () => void;
        passExpensesTutorial: () => void;
        passWelcomeTutorial: () => void;
        setCurrentPeriod: (value: CurrentPeriod) => void;
        addIncomeItem: (value: IncomeItem) => void;
        updateIncomeItem: (index: number, value: IncomeItem) => void;
        removeIncomeItem: (index: number) => void;
        addObligationItem: (value: ObligationItem) => void;
        updateObligationItem: (index: number, value: ObligationItem) => void;
        removeObligationItem: (index: number) => void;
        addExpenseItem: (value: ExpenseItem) => void;
        addExpenseItems: (values: ExpenseItem[]) => void;
        updateExpenseItem: (index: number, value: ExpenseItem) => void;
        removeExpenseItem: (index: number) => void;
        selectPeriod: (id: string) => void;
        startNewMonth: (value: CurrentPeriod) => void;
    }
}

export type IndexedItemUpdate<T> = {
    index: number;
    item: T;
}

export type Action = {
    type: ACTION_TYPES,
    payload?: ExpenseItem | ExpenseItem[] | IncomeItem | ObligationItem | CurrentPeriod | TUTORIAL_NAMES | Store | IndexedItemUpdate<ExpenseItem | IncomeItem | ObligationItem> | number | string,
}