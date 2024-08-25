import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";

export type CurrentPeriod = {
    name: string;
    month: number;
}

export type IncomeItem = {
    date: Date;
    amount: number;
    label: string;
}

// could differ form incomeItem in the future
export type ObligationItem = {
    date: Date;
    amount: number;
    label: string;
}

export function isIncomeItemPassed(value: any): value is IncomeItem {
    const isDateDefined = !!value?.date && value.date instanceof Date;
    const isAmountDefined = !!value?.amount && typeof value.amount === 'number';
    const isLabelDefined = !!value?.label && typeof value.label === 'string';
    return isDateDefined && isAmountDefined && isLabelDefined;
}

// may differ from isIncomeItemPassed in future
export function isObligationItemPassed(value: any): value is ObligationItem {
    const isDateDefined = !!value?.date && value.date instanceof Date;
    const isAmountDefined = !!value?.amount && typeof value.amount === 'number';
    const isLabelDefined = !!value?.label && typeof value.label === 'string';
    return isDateDefined && isAmountDefined && isLabelDefined;
}

export function isCurrentPeriodPassed(value: any): value is CurrentPeriod {
    const isNameDefined = !!value?.name;
    const isMonthDefined = !!value?.month;
    return isNameDefined && isMonthDefined;
}

export type Store = {
    incomeTutorialPassed: boolean;
    obligationsTutorialPassed: boolean;
    expensesTutorialPassed: boolean;
    welcomeTutorialPassed: boolean;
    currentPeriod: CurrentPeriod
    incomeItems: IncomeItem[];
    obligationItems: ObligationItem[];
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
        addObligationItem: (value: IncomeItem) => void;
    }
}

export type Action = {
    type: ACTION_TYPES,
    payload?: IncomeItem | ObligationItem | CurrentPeriod | TUTORIAL_NAMES,
}