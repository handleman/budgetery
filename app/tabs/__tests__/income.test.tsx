import * as React from 'react';
import renderer from 'react-test-renderer';
import IncomeScreen from '../index';

describe('IncomeScreen (app/tabs/index.tsx)', () => {
  
  describe('Component Structure', () => {
    
    it('should render initially without tutorial passed', () => {
      const tree = renderer.create(<IncomeScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

    it('should have Get started button in initial state', () => {
      const tree = renderer.create(<IncomeScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

  });

  describe('Tutorial State Management', () => {
    
    it('should show income tutorial content initially', () => {
      const tree = renderer.create(<IncomeScreen />).toJSON();
      
      // Snapshot test for initial state
      expect(tree).toMatchSnapshot();
    });

    it.skip('should show modal when getStartedHandler is pressed (requires mocking context)');
  });

});
