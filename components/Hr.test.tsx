import * as React from 'react';
import renderer from 'react-test-renderer';
import Hr from './Hr';

describe('Hr', () => {
  
  it('should render with border-bottom style', () => {
    const tree = renderer.create(<Hr />).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

});
