import React, { createContext, useReducer } from 'react';
import { ACTION_TYPES, TUTORIAL_NAMES } from './enums';
import { AppContext } from './types';
import { appReducer } from './reducer';


const defaultStore = {
    incomeTutorialPassed: false,
    obligationsTutorialPassed: false,
    expensesTutorialPassed: false,
};
export const appContext = createContext<AppContext>({
    store: defaultStore,
    mutators: {
        passIncomeTutorial: () => { },
        passObligationsTutorial: () => { },
        passExpensesTutorial: () => { },
    }
});




const ContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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


    const value = {
        store,
        mutators: {
            passIncomeTutorial,
            passObligationsTutorial,
            passExpensesTutorial
        }
    }

    return <appContext.Provider
        value={value}
    >
        {children}
    </appContext.Provider>
}

export default ContextProvider;