import { ACTION_TYPES, TUTORIAL_NAMES } from "./enums";
import { Action, CurrentPeriod, IncomeItem, ExpenseItem, isCurrentPeriodPassed, isIncomeItemPassed, isObligationItemPassed, ObligationItem, Store, isExpenseItemPassed } from "./types";


function remainsReducer(store: Store): Store {
    const { remainingBudget, expenseItems } = store;
    const expensesTotal = expenseItems.reduce((acc, current) => acc + current.amount, 0);

    return {
        ...store,
        remains: remainingBudget - expensesTotal,
    }
}

function daylyBudgetReducer(store: Store): Store {
    const month = store.currentPeriod.month;
    const targetDate = new Date(new Date().getFullYear(), month, 0);
    const daysInPeriod = targetDate.getDate();
    const { remainingBudget } = store;
    return {
        ...store,
        daylyBudget: remainingBudget / daysInPeriod,

    }
}

function currentPeriodReducer(store: Store, payload: CurrentPeriod): Store {
    return {
        ...store,
        currentPeriod: payload,
    }
}
function remainingBudgetReducer(store: Store): Store {
    const { totalBudget, totalObligations } = store;
    return {
        ...store,
        remainingBudget: totalBudget - totalObligations,
    };
}

function totalPercentageObligationsReducer(store: Store): Store {
    const { totalBudget, obligationItems } = store;
    const percentageObligations = obligationItems.reduce((acc, current) => current.isPercentage ? acc + current.amount : acc, 0);
    const percentageApplied = totalBudget * (percentageObligations / 100);
    return {
        ...store,
        totalPercentageObligations: percentageApplied,
    }
};
function totalObligationsReducer(store: Store): Store {
    const { obligationItems, totalPercentageObligations } = store;
    const obligationsPlainSum = obligationItems.reduce((acc, current) => !current.isPercentage ? acc + current.amount : acc, 0);
    const totalObligationsApplied = obligationsPlainSum + totalPercentageObligations;
    return {
        ...store,
        totalObligations: totalObligationsApplied,
    }
};

function totalBudgetReducer(store: Store): Store {
    const { incomeItems } = store;
    const incomeAmount = incomeItems.reduce((acc, current) => acc + current.amount, 0);
    return {
        ...store,
        totalBudget: incomeAmount,
    }
};
function addIncomeItemReducer(store: Store, payload: IncomeItem): Store {
    const incomeAddedStore = {
        ...store,
        incomeItems: [...store.incomeItems, payload],
    };

    return daylyBudgetReducer(
        daylyBudgetReducer(
            totalPercentageObligationsReducer(
                totalBudgetReducer(incomeAddedStore)
            )
        )
    );
}

function addObligationItemReducer(store: Store, payload: ObligationItem): Store {
    const obligationAddedStore = {
        ...store,
        obligationItems: [...store.obligationItems, payload],
    };
    const { isPercentage } = payload;

    if (isPercentage) {
        return daylyBudgetReducer(
            remainingBudgetReducer(
                totalObligationsReducer(
                    totalPercentageObligationsReducer(obligationAddedStore)
                )
            )
        );
    }
    return daylyBudgetReducer(
        remainingBudgetReducer(
            totalObligationsReducer(
                obligationAddedStore
            )
        )
    );
}

function addExpenseItemReducer(store: Store, payload: ExpenseItem): Store {
    const expenseAdded = {
        ...store,
        expenseItems: [...store.expenseItems, payload],
    }
    return remainsReducer(expenseAdded);
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
        case ACTION_TYPES.ADD_EXPENSE:
            if (isExpenseItemPassed(payload)) {
                return addExpenseItemReducer(store, payload);
            }
        default:
            break
    }
    return store;
};

