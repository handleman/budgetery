import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { ACTION_TYPES, TUTORIAL_NAMES } from './enums';
import { AppContext, CurrentPeriod, ExpenseItem, IncomeItem, ObligationItem, Store } from './types';
import { appReducer } from './reducer';
import { PersistenceService } from './persistence/service';

// Create singleton persistence service
const persistence = new PersistenceService();

const defaultStore: Store = {
    incomeTutorialPassed: false,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
    welcomeTutorialPassed: false,
    currentPeriod: {
        name: '',
        month: 0,
    },
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
};

export const defaultAppContextValue: AppContext = {
    store: defaultStore,
    mutators: {
        passIncomeTutorial: () => { },
        passObligationsTutorial: () => { },
        passExpensesTutorial: () => { },
        passWelcomeTutorial: () => { },
        setCurrentPeriod: (_value: CurrentPeriod) => { },
        addIncomeItem: (value: IncomeItem) => { },
        addObligationItem: (value: ObligationItem) => { },
        addExpenseItem: (value: ExpenseItem) => { },
    }
};

export const appContext = createContext<AppContext>(defaultAppContextValue);

const AppContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [store, dispatch] = useReducer(appReducer, defaultStore);
    const initialized = useRef(false);
    
    // Hydrate from storage when first loaded
    useEffect(() => {
        if (initialized.current) return;

        persistence.initialize().then(async () => {
            try {
                const hydratedStore = await persistence.load();

                if (hydratedStore && persistence.isValidStore(hydratedStore)) {
                    dispatch({ type: ACTION_TYPES.LOAD_STORE, payload: hydratedStore });
                }

                initialized.current = true;
            } catch (error) {
                console.error('Hydration error:', error);
                // Continue without persisted data (graceful degradation)
                initialized.current = true;
            }
        }).catch(console.error);

        return () => undefined; // Cleanup not needed
    }, []);

    // Persist on every store change once hydration finished, so user
    // actions survive app restarts (replaces the one-off save on load).
    useEffect(() => {
        if (!initialized.current) return;

        persistence.save(store).catch((error) => {
            console.error('Persist error:', error);
        });
    }, [store]);

    function passIncomeTutorial() {
        dispatch({ type: ACTION_TYPES.PASS_TUTORIAL, payload: TUTORIAL_NAMES.income });
    }
    function passObligationsTutorial() {
        dispatch({ type: ACTION_TYPES.PASS_TUTORIAL, payload: TUTORIAL_NAMES.obligations });
    }
    function passExpensesTutorial() {
        dispatch({ type: ACTION_TYPES.PASS_TUTORIAL, payload: TUTORIAL_NAMES.expenses });
    }
    function passWelcomeTutorial() {
        dispatch({ type: ACTION_TYPES.PASS_TUTORIAL, payload: TUTORIAL_NAMES.welcome });
    }
    function setCurrentPeriod(passed: CurrentPeriod) {
        dispatch({ type: ACTION_TYPES.ADD_PERIOD, payload: passed });
    }
    function addIncomeItem(passed: IncomeItem) {
        dispatch({ type: ACTION_TYPES.ADD_INCOME, payload: passed });
    }
    function addObligationItem(passed: ObligationItem) {
        dispatch({ type: ACTION_TYPES.ADD_OBLIGATION, payload: passed });
    }
    function addExpenseItem(passed: ExpenseItem) {
        dispatch({ type: ACTION_TYPES.ADD_EXPENSE, payload: passed });
    }

    const value = {
        store,
        mutators: {
            passIncomeTutorial,
            passObligationsTutorial,
            passExpensesTutorial,
            passWelcomeTutorial,
            setCurrentPeriod,
            addIncomeItem,
            addObligationItem,
            addExpenseItem,
        }
    }

    return <appContext.Provider
        value={value}
    >
        {children}
    </appContext.Provider>
};

export default AppContextProvider;
