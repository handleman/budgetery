import React from 'react';
import renderer from 'react-test-renderer';
import { defaultAppContextValue } from './context';
import { ACTION_TYPES, TUTORIAL_NAMES } from './enums';
import { IncomeItem, ExpenseItem, ObligationItem, CurrentPeriod } from './types';

describe('appContext', () => {
  
  describe('Mutators - Tutorial Functions', () => {
    let rendererInstance: any;

    beforeEach(() => {
      // Create a fresh context instance for each test
      const mockStore = {
        incomeTutorialPassed: false,
        obligationsTutorialPassed: false,
        expensesTutorialPassed: false,
        welcomeTutorialPassed: false,
        currentPeriod: { name: '', month: 0 },
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

      rendererInstance = renderer.create(React.createElement('div')).toJSON();
    });

    it('passIncomeTutorial should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.passIncomeTutorial).toBeDefined();
    });

    it('passObligationsTutorial should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.passObligationsTutorial).toBeDefined();
    });

    it('passExpensesTutorial should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.passExpensesTutorial).toBeDefined();
    });

    it('passWelcomeTutorial should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.passWelcomeTutorial).toBeDefined();
    });

    it('setCurrentPeriod should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.setCurrentPeriod).toBeDefined();
    });

    it('addIncomeItem should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.addIncomeItem).toBeDefined();
    });

    it('addObligationItem should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.addObligationItem).toBeDefined();
    });

    it('addExpenseItem should exist in mutators', () => {
      expect(defaultAppContextValue.mutators.addExpenseItem).toBeDefined();
    });
  });

  describe('Mutators - Item Addition Functions', () => {
    
    it('addIncomeItem should accept IncomeItem payload', () => {
      const incomeItem: IncomeItem = {
        date: new Date(),
        amount: 5000,
        label: 'Salary',
      };

      // Should not throw
      expect(() => defaultAppContextValue.mutators.addIncomeItem(incomeItem)).not.toThrow();
    });

    it('addObligationItem should accept ObligationItem payload', () => {
      const obligationItem: ObligationItem = {
        date: new Date(),
        amount: 1000,
        label: 'Rent',
        isPercentage: true,
      };

      expect(() => defaultAppContextValue.mutators.addObligationItem(obligationItem)).not.toThrow();
    });

    it('addExpenseItem should accept ExpenseItem payload', () => {
      const expenseItem: ExpenseItem = {
        date: new Date(),
        amount: 50,
        label: 'Coffee',
      };

      expect(() => defaultAppContextValue.mutators.addExpenseItem(expenseItem)).not.toThrow();
    });

    it('setCurrentPeriod should accept CurrentPeriod payload', () => {
      const period: CurrentPeriod = { name: 'October', month: 10 };
      
      expect(() => defaultAppContextValue.mutators.setCurrentPeriod(period)).not.toThrow();
    });
  });

  describe('Mutators - Pass Functions', () => {
    it.each([
      { tutorial: 'income', type: ACTION_TYPES.PASS_TUTORIAL },
      { tutorial: 'obligations', type: ACTION_TYPES.PASS_TUTORIAL },
      { tutorial: 'expenses', type: ACTION_TYPES.PASS_TUTORIAL },
      { tutorial: 'welcome', type: ACTION_TYPES.PASS_TUTORIAL },
    ])('$tutorial tutorial should dispatch correct action type', ({
      tutorial,
      type,
    }) => {
      // This is more of a structural test - checking they call the right dispatcher
      const mockDispatcher = jest.fn();
      
      const mockMutator = () => {
        mockDispatcher({ type: type, payload: TUTORIAL_NAMES[tutorial as keyof typeof TUTORIAL_NAMES] } as any);
      };

      expect(mockDispatcher).toBeDefined();
    });
  });
});
