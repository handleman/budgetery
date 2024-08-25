import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";
import { Action, CurrentPeriodPassed, IncomeItem, isCurrentPeriodPassed, isIncomeItemPassed, isObligationItemPassed, ObligationItem, Store } from "./types";


function currentPeriodReducer(store: Store, payload: CurrentPeriodPassed): Store {
    return {
        ...store,
        currentPeriod: payload,
    }
}

function addIncomeItemReducer(store: Store, payload: IncomeItem): Store {
    return {
        ...store,
        incomeItems: [...store.incomeItems, payload],
    }
}

function addObligationItemReducer(store: Store, payload: ObligationItem): Store {
    return {
        ...store,
        obligationItems: [...store.obligationItems, payload],
    }
}



export function appReducer(store: Store, action: Action): Store {
    const { payload } = action;
    switch (action.type) {
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
        case ACTION_TYPES.ADD_PERIOD:
            if (isCurrentPeriodPassed(payload)) {
                return currentPeriodReducer(store, payload);
            }
        case ACTION_TYPES.ADD_INCOME:
            if (isIncomeItemPassed(payload)) {
                return addIncomeItemReducer(store, payload);
            }
        case ACTION_TYPES.ADD_OBLIGATION:
            if (isObligationItemPassed(payload)) {
                return addObligationItemReducer(store, payload);
            }
        default:
            break
    }
    return store;
};

