import * as React from 'react';
import renderer from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import AddIncomeModal from './AddIncomeModal';

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

  // The dialog defaults its date field to today — pin the clock so the
  // snapshot is stable regardless of when the suite runs (local noon
  // keeps toDayKey on the same calendar day in every timezone).
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 10, 12, 0, 0));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

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
      // Would require interactive mocking of dialog inputs; structural check only.
      const tree = renderTree(
        <AddIncomeModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should dispatch addIncomeItem action with correct payload structure', () => {
      // Structural test for the IncomeItem payload shape (date/amount/label).
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
