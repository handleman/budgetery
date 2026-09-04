import { TUTORIAL_NAMES, ACTION_TYPES } from './enums';

describe('TUTORIAL_NAMES', () => {
  
  it('should have income tutorial name', () => {
    expect(TUTORIAL_NAMES.income).toBe('income');
  });

  it('should have obligations tutorial name', () => {
    expect(TUTORIAL_NAMES.obligations).toBe('obligations');
  });

  it('should have expenses tutorial name', () => {
    expect(TUTORIAL_NAMES.expenses).toBe('expenses');
  });

  it('should have welcome tutorial name', () => {
    expect(TUTORIAL_NAMES.welcome).toBe('welcome');
  });
});

describe('ACTION_TYPES', () => {
  
  it('should have PASS_TUTORIAL action type', () => {
    expect(ACTION_TYPES.PASS_TUTORIAL).toBe('PASS_TUTORIAL');
  });

  it('should have ADD_PERIOD action type', () => {
    expect(ACTION_TYPES.ADD_PERIOD).toBe('ADD_PERIOD');
  });

  it('should have ADD_INCOME action type', () => {
    expect(ACTION_TYPES.ADD_INCOME).toBe('ADD_INCOME');
  });

  it('should have ADD_OBLIGATION action type', () => {
    expect(ACTION_TYPES.ADD_OBLIGATION).toBe('ADD_OBLIGATION');
  });

  it('should have ADD_EXPENSE action type', () => {
    expect(ACTION_TYPES.ADD_EXPENSE).toBe('ADD_EXPENSE');
  });
});
