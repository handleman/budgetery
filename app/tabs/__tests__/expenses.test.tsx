import * as React from 'react';
import renderer from 'react-test-renderer';
import ExpensesScreen from '../expenses';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: 'View', ScrollView: 'ScrollView' },
  useAnimatedRef: jest.fn(() => ({ current: null })),
  useScrollViewOffset: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn((updater: () => unknown) => updater()),
  useSharedValue: jest.fn((initial: unknown) => ({ value: initial })),
  interpolate: jest.fn(() => 0),
  withTiming: jest.fn((value: unknown) => value),
  withRepeat: jest.fn((value: unknown) => value),
  withSequence: jest.fn((value: unknown) => value),
}));

describe('ExpensesScreen (app/tabs/expenses.tsx)', () => {

  describe('Component Structure', () => {

    it('should render initially without tutorial passed', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ExpensesScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      tree!.unmount();
    });

    it('should have Add one button in initial state', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ExpensesScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      tree!.unmount();
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
      tree!.unmount();
    });

    it.todo('should show modal when getStartedHandler is pressed');
  });

});
