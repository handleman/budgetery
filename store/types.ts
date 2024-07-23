import { ACTION_TYPES } from "./enums";

export type CurrentPeriod = {
    name: string;
    month: number | null;
}
export interface CurrentPeriodPassed {
    name: string;
    month: number;
}

export function isCurrentPeriodPassed(value: any): value is CurrentPeriodPassed {
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
};

export type AppContext = {
    store: Store;
    mutators: {
        passIncomeTutorial: () => void;
        passObligationsTutorial: () => void;
        passExpensesTutorial: () => void;
        passWelcomeTutorial: () => void;
        setCurrentPeriod: (value: CurrentPeriodPassed) => void;
    }
}

export type Action = {
    type: ACTION_TYPES,
    payload?: unknown,
}