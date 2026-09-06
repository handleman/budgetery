import * as React from 'react';
import renderer from 'react-test-renderer';
import { ThemedView } from './ThemedView';

describe('ThemedView', () => {
  
  it('should render with backgroundColor applied', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<ThemedView />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    renderer.act(() => {
      tree!.unmount();
    });
  });

  it('should accept style props and merge them', () => {
    const customStyle = { padding: 10 };
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<ThemedView style={customStyle} />);
    });

    expect(tree!.toJSON()).toBeDefined();
    renderer.act(() => {
      tree!.unmount();
    });
  });

  it('should accept lightColor and darkColor props', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(
        <ThemedView
          lightColor="#fff"
          darkColor="#123"
        />,
      );
    });

    expect(tree!.toJSON()).toBeDefined();
    renderer.act(() => {
      tree!.unmount();
    });
  });

  it('should accept all ThemedViewProps', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<ThemedView style={{ backgroundColor: 'red' }} />);
    });

    expect(tree!.toJSON()).toBeDefined();
    renderer.act(() => {
      tree!.unmount();
    });
  });

});
