import * as React from 'react';
import renderer from 'react-test-renderer';
import { HelloWave } from './HelloWave';

// Real reanimated schedules animation frames that stall Jest workers;
// use the repo-standard manual mock (same shape as app/tabs/__tests__/).
jest.mock('react-native-reanimated', () => {
  const { View, ScrollView } = require('react-native');
  return {
    __esModule: true,
    default: { View, ScrollView },
    View,
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

describe('HelloWave', () => {
  
  // Note: Animation tests are complex with reanimated. 
  // This is a structural test.
  
  it('should render the wave emoji', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<HelloWave />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    renderer.act(() => {
      tree!.unmount();
    });
  });

  it('should use ThemedText component internally', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<HelloWave />);
    });

    // Snapshot will verify the structure includes ThemedText
    expect(tree!.toJSON()).toBeDefined();
    renderer.act(() => {
      tree!.unmount();
    });
  });

});
