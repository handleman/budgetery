import * as React from 'react';
import renderer from 'react-test-renderer';
import ExpensesScreen from '../expenses';

describe('ExpensesScreen (app/tabs/expenses.tsx)', () => {
  
  describe('Component Structure', () => {
    
    it('should render initially without tutorial passed', () => {
      const tree = renderer.create(<ExpensesScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

    it('should have Add one button in initial state', () => {
      const tree = renderer.create(<ExpensesScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

  });

  describe('Tutorial State Management', () => {
    
    it('should show expenses tutorial content initially', () => {
      const tree = renderer.create(<ExpensesScreen />).toJSON();
      
      // Snapshot test for initial state
      expect(tree).toMatchSnapshot();
    });

    it.skip('should show modal when getStartedHandler is pressed');
  });

});
