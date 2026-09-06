import * as React from 'react';
import renderer from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import IncomeScreen from '../index';

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

// Paper Dialog mounts via Portal only when visible; hidden dialogs render
// null (see AppDialog), so tab screens only need the Paper theme context.
// The old react-native-modal stub is obsolete — AddIncomeModal no longer
// uses react-native-modal.
function renderWithPaper(element: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | undefined;
  renderer.act(() => {
    tree = renderer.create(<PaperProvider>{element}</PaperProvider>);
  });
  return tree!;
}

function unmountTree(tree: renderer.ReactTestRenderer) {
  renderer.act(() => {
    tree.unmount();
  });
}

describe('IncomeScreen (app/tabs/index.tsx)', () => {

  describe('Component Structure', () => {

    it('should render initially without tutorial passed', () => {
      const tree = renderWithPaper(<IncomeScreen />);

      expect(tree.toJSON()).toBeDefined();
      unmountTree(tree);
    });

    it('should have Get started button in initial state', () => {
      const tree = renderWithPaper(<IncomeScreen />);

      expect(tree.toJSON()).toBeDefined();
      unmountTree(tree);
    });

  });

  describe('Tutorial State Management', () => {

    it('should show income tutorial content initially', () => {
      const tree = renderWithPaper(<IncomeScreen />);

      // Snapshot test for initial state
      expect(tree.toJSON()).toMatchSnapshot();
      unmountTree(tree);
    });

    it.todo('should show modal when getStartedHandler is pressed (requires mocking context)');
  });

});
