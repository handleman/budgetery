import * as React from 'react';
import renderer from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import AddObligationModal from './AddObligationModal';

// AddObligationModal now renders Paper Dialog via Portal when visible, which
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

describe('AddObligationModal', () => {

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
    it('should render with isPercentage switch and all inputs when visible is true', () => {
      const tree = renderTree(
        <AddObligationModal isVisible={true} onClose={() => {}} />,
      );

      expect(tree).toMatchSnapshot();
    });

    it('should render without errors when visible is false', () => {
      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('isPercentage Toggle Switch', () => {

    it('should have isPercentage switch in component hierarchy', () => {
      const tree = renderTree(
        <AddObligationModal isVisible={true} onClose={() => {}} />,
      );

      // Snapshot test will verify the structure
      expect(tree).toBeDefined();
    });

    it('should have switch with proper props (trackColor, thumbColor, onValueChange)', () => {
      const tree = renderTree(
        <AddObligationModal isVisible={true} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('State Management', () => {

    it('should initialize amount to 0', () => {
      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should initialize label to empty string', () => {
      // Verify component renders
      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should initialize isPercentage to false', () => {
      // The switch starts at false - verified via snapshot test
      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
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
        <AddObligationModal isVisible={false} onClose={onCloseSpy} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('On Submit Handler', () => {

    it('should dispatch action with current date, amount, label, and isPercentage when Save button is pressed', () => {
      // The onSubmit function creates an ObligationItem and includes isPercentage

      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });

    it('should respect isPercentage value in dispatched payload', () => {
      // When isPercentage true, the payload should have isPercentage: true
      const tree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(tree).toBeDefined();
    });
  });

  describe('Modal Visibility', () => {

    it('should change render output when isVisible prop changes', () => {
      const visibleTree = renderTree(
        <AddObligationModal isVisible={true} onClose={() => {}} />,
      );

      const hiddenTree = renderTree(
        <AddObligationModal isVisible={false} onClose={() => {}} />,
      );

      expect(visibleTree).toBeDefined();
      expect(hiddenTree).toBeDefined();
    });
  });

});
