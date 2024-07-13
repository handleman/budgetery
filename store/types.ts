import { ACTION_TYPES } from "./enums";

export type Store = {
    incomeTutorialPassed: boolean;
    obligationsTutorialPassed: boolean;
    expensesTutorialPassed: boolean;

};

export type AppContext = {
    store: Store;
    mutators: {
        passIncomeTutorial: () => void;
        passObligationsTutorial: () => void;
        passExpensesTutorial: () => void;
    }
}

export type Action = {
    type: ACTION_TYPES,
    payload?: unknown,
}