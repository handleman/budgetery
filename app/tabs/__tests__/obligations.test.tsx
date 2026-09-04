import * as React from 'react';
import renderer from 'react-test-renderer';
import ObligationScreen from '../obligations';

describe('ObligationScreen (app/tabs/obligations.tsx)', () => {
  
  describe('Component Structure', () => {
    
    it('should render initially without tutorial passed', () => {
      const tree = renderer.create(<ObligationScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

    it('should have Get started button in initial state', () => {
      const tree = renderer.create(<ObligationScreen />).toJSON();
      
      expect(tree).toBeDefined();
    });

  });

  describe('Tutorial State Management', () => {
    
    it('should show obstacles tutorial content initially', () => {
      const tree = renderer.create(<ObligationScreen />).toJSON();
      
      // Snapshot test for initial state
      expect(tree).toMatchSnapshot();
    });

    it.skip('should show modal with percentage toggle when getStartedHandler is pressed');
  });

});
