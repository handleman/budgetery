import * as React from 'react';
import renderer from 'react-test-renderer';
import Hr from './Hr';

describe('Hr', () => {
  
  it('should render with border-bottom style', () => {
    let tree: renderer.ReactTestRenderer | undefined;
    renderer.act(() => {
      tree = renderer.create(<Hr />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
    renderer.act(() => {
      tree!.unmount();
    });
  });

});
