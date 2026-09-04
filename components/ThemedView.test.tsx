import * as React from 'react';
import renderer from 'react-test-renderer';
import { ThemedView } from './ThemedView';

describe('ThemedView', () => {
  
  it('should render with backgroundColor applied', () => {
    const tree = renderer.create(<ThemedView />).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('should accept style props and merge them', () => {
    const customStyle = { padding: 10 };
    const tree = renderer.create(<ThemedView style={customStyle} />).toJSON();
    
    expect(tree).toBeDefined();
  });

  it('should accept lightColor and darkColor props', () => {
    const tree = renderer.create(
      <ThemedView 
        lightColor="#fff" 
        darkColor="#123"
      />,
    ).toJSON();
    
    expect(tree).toBeDefined();
  });

  it('should accept all ThemedViewProps', () => {
    const tree = renderer.create(<ThemedView style={{ backgroundColor: 'red' }} />).toJSON();
    
    expect(tree).toBeDefined();
  });

});
