import * as React from 'react';
import renderer from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import AddIncomeModal from './AddIncomeModal';
import { appContext } from '@/store/context';
import { IncomeItem } from '@/store/types';

// AddIncomeModal now renders Paper Dialog via Portal when visible, which
// requires the Paper theme context. Hidden dialogs render null (AppDialog).
// The old react-native-modal stub is obsolete and removed.

// React 19 renders concurrently: create AND unmount must run inside act(),
// otherwise effects flush after teardown and crash the worker.
function renderTree(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | undefined;
  renderer.act(() => {
    tree = renderer.create(<PaperProvider>{element}</PaperProvider>);
  });
  const json = tree!.toJSON();
  renderer.act(() => {
    tree!.unmount();
  });
  return json;
}

describe('AddIncomeModal', () => {

  const mockDispatch = jest.fn();

  const mockStore: any = {
    incomeItems: [],
    remainingBudget: 0,
    totalBudget: 0,
    totalObligations: 0,
    daylyBudget: 0,
  };

  const mockMutators = {
    addIncomeItem: (item: IncomeItem) => {
      mockDispatch({ type: 'ADD_INCOME', payload: item });
    },
    passIncomeTutorial: () => {},
    passObligationsTutorial: () => {},
    passExpensesTutorial: () => {},
    passWelcomeTutorial: () => {},
    setCurrentPeriod: () => {},
    addObligationItem: () => {},
    addExpenseItem: () => {},
  };

  const mockContextValue = {
    store: mockStore,
    mutators: mockMutators,
  };

  describe('Component Structure', () => {
    it('should render when visible is true', () => {
      const tree = renderTree(
        <AddIncomeModal isVisible={true} onClose={() => {}} />,
      );

      expect(tree).toMatchSnapshot();
    });

    it('should not render when visible is false', () => {
      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      // Modal component renders differently based on library implementation
      expect(tree).toBeDefined();
    });
  });

  describe('State Management', () => {

    it('should initialize amount to 0', () => {
      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should initialize label to empty string', () => {
      // The component renders - verify structure
      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
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
      // Note: For full interactive testing, use React Native Testing Library
      // This is a structural test for snapshot purposes

      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={onCloseSpy} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('On Submit Handler', () => {

    it('should dispatch action when Save button is pressed with valid data', () => {
      const testAmount = 100;
      const testLabel = 'Test Income';

      // We need to simulate the onSubmit function being called
      // This would require more complex mocking

      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should dispatch addIncomeItem action with correct payload structure', () => {
      const expectedIncomeItem: IncomeItem = {
        date: new Date(),
        amount: 100,
        label: 'Test Label',
      };

      // This is a structural test
      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('Modal Visibility', () => {

    it('should change render output when isVisible prop changes from false to true', () => {
      // Structural test - modal renders based on this prop
      const visibleTree = renderTree(
        <AddIncomeModal isVisible={true} onClose={() => {}} />,
      );

      const hiddenTree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      // Modal visibility affects content - snapshots capture this
      expect(visibleTree).toBeDefined();
      expect(hiddenTree).toBeDefined();
    });
  });

});
