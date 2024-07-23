import React, { createContext, useReducer } from 'react';
import { ACTION_TYPES, TUTORIAL_NAMES } from './enums';
import { AppContext, CurrentPeriodPassed, Store } from './types';
import { appReducer } from './reducer';


const defaultStore: Store = {
    incomeTutorialPassed: false,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
    welcomeTutorialPassed: false,
    currentPeriod: {
        name: '',
        month: null,
    }
};

export const appContext = createContext<AppContext>({
    store: defaultStore,
    mutators: {
        passIncomeTutorial: () => { },
        passObligationsTutorial: () => { },
        passExpensesTutorial: () => { },
        passWelcomeTutorial: () => { },
        setCurrentPeriod: ({ name: string, month: number }) => { },
    }
});




const AppContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [store, dispatch] = useReducer(appReducer, defaultStore);

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
    function setCurrentPeriod(passed: CurrentPeriodPassed) {
        dispatch({ type: ACTION_TYPES.ADD_PERIOD, payload: passed });
    }

    const value = {
        store,
        mutators: {
            passIncomeTutorial,
            passObligationsTutorial,
            passExpensesTutorial,
            passWelcomeTutorial,
            setCurrentPeriod,
        }
    }

    return <appContext.Provider
        value={value}
    >
        {children}
    </appContext.Provider>
}

export default AppContextProvider;