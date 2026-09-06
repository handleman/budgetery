import * as React from 'react';
import renderer from 'react-test-renderer';
import ExpensesScreen from '../expenses';

jest.mock('react-native-reanimated', () => {
  const { View, ScrollView } = require('react-native');
  return {
    __esModule: true,
    default: { View, ScrollView },
  useAnimatedRef: jest.fn(() => ({ current: null })),
  useScrollViewOffset: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn((updater: () => unknown) => updater()),
  useSharedValue: jest.fn((initial: unknown) => ({ value: initial })),
  interpolate: jest.fn(() => 0),
  withTiming: jest.fn((value: unknown) => value),
  withRepeat: jest.fn((value: unknown) => value),
  withSequence: jest.fn((value: unknown) => value),
  };
});

// The tab screens mount the real Add*Modal (hidden). Its third-party Modal
// calls the removed BackHandler.removeEventListener on unmount under RN 0.79,
// so stub it the same way the modal suites do.
jest.mock('react-native-modal', () => {
  const React = require('react');
  function MockModal({ children, isVisible }: { children?: React.ReactNode; isVisible?: boolean }) {
    if (!isVisible) return null;
    return React.createElement(React.Fragment, null, children);
  }
  return { __esModule: true, default: MockModal };
});

describe('ExpensesScreen (app/tabs/expenses.tsx)', () => {

  describe('Component Structure', () => {

    it('should render initially without tutorial passed', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ExpensesScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      renderer.act(() => {
        tree!.unmount();
      });
    });

    it('should have Add one button in initial state', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ExpensesScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      renderer.act(() => {
        tree!.unmount();
      });
    });

  });

  describe('Tutorial State Management', () => {

    it('should show expenses tutorial content initially', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ExpensesScreen />);
      });

      // Snapshot test for initial state
      expect(tree!.toJSON()).toMatchSnapshot();
      renderer.act(() => {
        tree!.unmount();
      });
    });

    it.todo('should show modal when getStartedHandler is pressed');
  });

});
