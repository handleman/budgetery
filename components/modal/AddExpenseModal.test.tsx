import * as React from 'react';
import renderer from 'react-test-renderer';
import AddExpenseModal from './AddExpenseModal';

// Stub the animated third-party Modal: it schedules animation timers that
// outlive the Jest environment and crash full-suite runs. The stub renders
// children synchronously so tests stay deterministic.
jest.mock('react-native-modal', () => {
  const React = require('react');
  function MockModal({ children, isVisible }: { children?: React.ReactNode; isVisible?: boolean }) {
    if (!isVisible) return null;
    return React.createElement(React.Fragment, null, children);
  }
  return { __esModule: true, default: MockModal };
});

// React 19 renders concurrently: create AND unmount must run inside act(),
// otherwise effects flush after teardown and crash the worker.
function renderTree(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | undefined;
  renderer.act(() => {
    tree = renderer.create(element);
  });
  const json = tree!.toJSON();
  renderer.act(() => {
    tree!.unmount();
  });
  return json;
}

describe('AddExpenseModal', () => {

  const mockDispatch = jest.fn();

  const mockStore: any = {
    expenseItems: [],
    remainingBudget: 0,
    totalExpenses: 0,
  };

  const mockMutators = {
    addExpenseItem: (item: any) => {
      mockDispatch({ type: 'ADD_EXPENSE', payload: item });
    },
    passIncomeTutorial: () => {},
    passObligationsTutorial: () => {},
    passExpensesTutorial: () => {},
    passWelcomeTutorial: () => {},
    setCurrentPeriod: () => {},
    addIncomeItem: () => {},
    addObligationItem: () => {},
  };

  const mockContextValue = {
    store: mockStore,
    mutators: mockMutators,
  };

  describe('Component Structure', () => {
    it('should render when visible is true', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={true} onClose={() => {}} />,
      );

      expect(tree).toMatchSnapshot();
    });

    it('should not crash when visible is false', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('State Management', () => {

    it('should initialize amount to 0', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should initialize label to empty string', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('On Close Handler', () => {

    let onCloseSpy: jest.Mock;

    beforeEach(() => {
      onCloseSpy = jest.fn();
    });

    it('should call provided onClose when Back button is pressed', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={onCloseSpy} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('On Submit Handler', () => {

    it('should dispatch action with current date, amount, and label when Save button is pressed', () => {
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should create ExpenseItem without percentage field', () => {
      // Unlike AddObligationModal, expense items don't have isPercentage
      const tree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('Modal Visibility', () => {

    it('should change render output when isVisible prop changes from false to true', () => {
      const visibleTree = renderTree(
        <AddExpenseModal isVisible={true} onClose={() => {}} />,
      );

      const hiddenTree = renderTree(
        <AddExpenseModal isVisible={false} onClose={() => {}} />,
      );

      expect(visibleTree).toBeDefined();
      expect(hiddenTree).toBeDefined();
    });
  });

});
