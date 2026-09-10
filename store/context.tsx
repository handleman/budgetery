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
    periods: [],
    currentPeriodId: null,
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
        updateIncomeItem: (_index: number, _value: IncomeItem) => { },
        removeIncomeItem: (_index: number) => { },
        addObligationItem: (value: ObligationItem) => { },
        updateObligationItem: (_index: number, _value: ObligationItem) => { },
        removeObligationItem: (_index: number) => { },
        addExpenseItem: (value: ExpenseItem) => { },
        addExpenseItems: (values: ExpenseItem[]) => { },
        updateExpenseItem: (_index: number, _value: ExpenseItem) => { },
        removeExpenseItem: (_index: number) => { },
        selectPeriod: (_id: string) => { },
        startNewMonth: (_value: CurrentPeriod) => { },
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
    function updateIncomeItem(index: number, passed: IncomeItem) {
        dispatch({ type: ACTION_TYPES.UPDATE_INCOME, payload: { index, item: passed } });
    }
    function removeIncomeItem(index: number) {
        dispatch({ type: ACTION_TYPES.REMOVE_INCOME, payload: index });
    }
    function addObligationItem(passed: ObligationItem) {
        dispatch({ type: ACTION_TYPES.ADD_OBLIGATION, payload: passed });
    }
    function updateObligationItem(index: number, passed: ObligationItem) {
        dispatch({ type: ACTION_TYPES.UPDATE_OBLIGATION, payload: { index, item: passed } });
    }
    function removeObligationItem(index: number) {
        dispatch({ type: ACTION_TYPES.REMOVE_OBLIGATION, payload: index });
    }
    function addExpenseItem(passed: ExpenseItem) {
        dispatch({ type: ACTION_TYPES.ADD_EXPENSE, payload: passed });
    }
    function addExpenseItems(passed: ExpenseItem[]) {
        dispatch({ type: ACTION_TYPES.ADD_EXPENSE, payload: passed });
    }
    function updateExpenseItem(index: number, passed: ExpenseItem) {
        dispatch({ type: ACTION_TYPES.UPDATE_EXPENSE, payload: { index, item: passed } });
    }
    function removeExpenseItem(index: number) {
        dispatch({ type: ACTION_TYPES.REMOVE_EXPENSE, payload: index });
    }
    function selectPeriod(id: string) {
        dispatch({ type: ACTION_TYPES.SELECT_PERIOD, payload: id });
    }
    function startNewMonth(passed: CurrentPeriod) {
        dispatch({ type: ACTION_TYPES.START_NEW_MONTH, payload: passed });
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
            updateIncomeItem,
            removeIncomeItem,
            addObligationItem,
            updateObligationItem,
            removeObligationItem,
            addExpenseItem,
            addExpenseItems,
            updateExpenseItem,
            removeExpenseItem,
            selectPeriod,
            startNewMonth,
        }
    }

    return <appContext.Provider
        value={value}
    >
        {children}
    </appContext.Provider>
};

export default AppContextProvider;
