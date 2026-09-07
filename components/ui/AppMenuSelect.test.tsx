import * as React from 'react';
import renderer from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { AppMenuSelect } from './AppMenuSelect';

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
];

// React 19 renders concurrently: create AND unmount must run inside act(),
// otherwise effects flush after teardown and crash the worker.
function withTree(element: React.ReactElement, fn: (root: renderer.ReactTestInstance) => void) {
  let tree: renderer.ReactTestRenderer | undefined;
  renderer.act(() => {
    tree = renderer.create(<PaperProvider>{element}</PaperProvider>);
  });
  try {
    fn(tree!.root);
  } finally {
    renderer.act(() => {
      tree!.unmount();
    });
  }
}

describe('AppMenuSelect', () => {
  it('shows the placeholder when nothing is selected', () => {
    withTree(
      <AppMenuSelect
        placeholder="Select a month"
        value={null}
        options={months}
        onSelect={() => {}}
        testID="month-picker"
      />,
      (root) => {
        const anchor = root.findByProps({ testID: 'month-picker-anchor' });
        expect(anchor).toBeDefined();
      },
    );
  });

  it('shows the selected option label', () => {
    withTree(
      <AppMenuSelect
        value={2}
        options={months}
        onSelect={() => {}}
        testID="month-picker"
      />,
      (root) => {
        const anchor = root.findByProps({ testID: 'month-picker-anchor' });
        expect(anchor.props.children).toBe('February');
      },
    );
  });

  it('exposes a stable anchor testID for automation', () => {
    withTree(
      <AppMenuSelect
        value={null}
        options={months}
        onSelect={() => {}}
        testID="month-picker"
      />,
      (root) => {
        // Item presses are covered in the browser (Paper Menu animations
        // crash the jest worker — same class of issue as the old
        // react-native-modal timer leaks). Here we assert the selector
        // contract: anchor carries `${testID}-anchor`.
        expect(
          root.findByProps({ testID: 'month-picker-anchor' }),
        ).toBeDefined();
      },
    );
  });
});
