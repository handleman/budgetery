import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";
import { Action, Store } from "./types";


export function appReducer(store: Store, action: Action): Store {
    switch (action.type) {
        case ACTION_TYPES.PASS_TUTORIAL:
            const { payload } = action;
            if (!payload) break;
            switch (payload) {
                case TUTORIAL_NAMES.income:
                    return { ...store, incomeTutorialPassed: true };
                case TUTORIAL_NAMES.obligations:
                    return { ...store, obligationsTutorialPassed: true };
                case TUTORIAL_NAMES.expenses:
                    return { ...store, expensesTutorialPassed: true };
            }
        default:
            break
    }
    return store;
};

