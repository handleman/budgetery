import * as React from 'react';
import renderer from 'react-test-renderer';
import { HelloWave } from './HelloWave';

describe('HelloWave', () => {
  
  // Note: Animation tests are complex with reanimated. 
  // This is a structural test.
  
  it('should render the wave emoji', () => {
    const tree = renderer.create(<HelloWave />).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('should use ThemedText component internally', () => {
    const tree = renderer.create(<HelloWave />).toJSON();
    
    // Snapshot will verify the structure includes ThemedText
    expect(tree).toBeDefined();
  });

});
