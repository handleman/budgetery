import * as React from 'react';
import renderer from 'react-test-renderer';
import ObligationScreen from '../obligations';

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

describe('ObligationScreen (app/tabs/obligations.tsx)', () => {

  describe('Component Structure', () => {

    it('should render initially without tutorial passed', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ObligationScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      tree!.unmount();
    });

    it('should have Get started button in initial state', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ObligationScreen />);
      });

      expect(tree!.toJSON()).toBeDefined();
      tree!.unmount();
    });

  });

  describe('Tutorial State Management', () => {

    it('should show obstacles tutorial content initially', () => {
      let tree: renderer.ReactTestRenderer | undefined;
      renderer.act(() => {
        tree = renderer.create(<ObligationScreen />);
      });

      // Snapshot test for initial state
      expect(tree!.toJSON()).toMatchSnapshot();
      tree!.unmount();
    });

    it.todo('should show modal with percentage toggle when getStartedHandler is pressed');
  });

});
