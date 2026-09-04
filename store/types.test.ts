import { 
  isIncomeItemPassed, 
  isExpenseItemPassed,
  isObligationItemPassed,
  isCurrentPeriodPassed
} from './types';
import { IncomeItem, ExpenseItem, ObligationItem, CurrentPeriod } from './types';

describe('Type Guards', () => {
  
  describe('isIncomeItemPassed', () => {
    const validIncomeItem: IncomeItem = {
      date: new Date(),
      amount: 5000,
      label: 'Salary',
    };

    it('should return true for valid income item', () => {
      expect(isIncomeItemPassed(validIncomeItem)).toBe(true);
    });

    it('should return false when date is missing', () => {
      const invalid = { amount: 100, label: 'Test' } as any;
      expect(isIncomeItemPassed(invalid)).toBe(false);
    });

    it('should return false when date is not a Date instance', () => {
      const invalid = { 
        date: 'not-a-date', 
        amount: 100, 
        label: 'Test' 
      } as any;
      expect(isIncomeItemPassed(invalid)).toBe(false);
    });

    it('should return false when amount is not a number', () => {
      const invalid = {
        date: new Date(),
        amount: '100', // string instead of number
        label: 'Test',
      } as any;
      expect(isIncomeItemPassed(invalid)).toBe(false);
    });

    it('should return false when label is not a string', () => {
      const invalid = {
        date: new Date(),
        amount: 100,
        label: 500, // number instead of string
      } as any;
      expect(isIncomeItemPassed(invalid)).toBe(false);
    });

    it('should return false when all fields are undefined', () => {
      const invalid = {} as any;
      expect(isIncomeItemPassed(invalid)).toBe(false);
    });

    it('should return false when value is null', () => {
      expect(isIncomeItemPassed(null)).toBe(false);
    });
  });

  describe('isExpenseItemPassed', () => {
    const validExpenseItem: ExpenseItem = {
      date: new Date(),
      amount: 50,
      label: 'Coffee',
    };

    it('should return true for valid expense item', () => {
      expect(isExpenseItemPassed(validExpenseItem)).toBe(true);
    });

    it('should return false when date is missing', () => {
      const invalid = { amount: 50, label: 'Test' } as any;
      expect(isExpenseItemPassed(invalid)).toBe(false);
    });

    it('should return false when amount is not a number', () => {
      const invalid = {
        date: new Date(),
        amount: 'invalid',
        label: 'Test',
      } as any;
      expect(isExpenseItemPassed(invalid)).toBe(false);
    });

    it('should return false when label is null', () => {
      const invalid = {
        date: new Date(),
        amount: 50,
        label: null as any,
      } as any;
      expect(isExpenseItemPassed(invalid)).toBe(false);
    });

    it('should return true for undefined object with all fields provided', () => {
      const valid = {
        date: new Date(),
        amount: 100,
        label: 'Valid Expense'
      };
      expect(isExpenseItemPassed(valid)).toBe(true);
    });
  });

  describe('isObligationItemPassed', () => {
    const validObligationItem: ObligationItem = {
      date: new Date(),
      amount: 1000,
      label: 'Rent',
      isPercentage: false,
    };

    it('should return true for valid obligation item with isPercentage false', () => {
      expect(isObligationItemPassed(validObligationItem)).toBe(true);
    });

    it('should return true for valid obligation item with isPercentage true', () => {
      const itemWithPercentage: ObligationItem = {
        ...validObligationItem,
        isPercentage: true,
      };
      expect(isObligationItemPassed(itemWithPercentage)).toBe(true);
    });

    it('should return false when isPercentage is missing', () => {
      const invalid = {
        date: new Date(),
        amount: 1000,
        label: 'Rent'
      } as any;
      expect(isObligationItemPassed(invalid)).toBe(false);
    });

    it('should return false when isPercentage is not a boolean', () => {
      const invalid = {
        date: new Date(),
        amount: 1000,
        label: 'Rent',
        isPercentage: 'true' as any, 
      };
      expect(isObligationItemPassed(invalid)).toBe(false);
    });

    it('should return false when isPercentage is a number', () => {
      const invalid = {
        date: new Date(),
        amount: 1000,
        label: 'Rent',
        isPercentage: 0 as any,
      };
      expect(isObligationItemPassed(invalid)).toBe(false);
    });

    it('should return false when isPercentage is a string', () => {
      const invalid = {
        date: new Date(),
        amount: 1000,
        label: 'Rent',
        isPercentage: 'yes' as any,
      };
      expect(isObligationItemPassed(invalid)).toBe(false);
    });
  });

  describe('isCurrentPeriodPassed', () => {
    it('should return true for valid current period', () => {
      const validPeriod: CurrentPeriod = { name: 'October', month: 10 };
      expect(isCurrentPeriodPassed(validPeriod)).toBe(true);
    });

    it('should return false when name is missing', () => {
      const invalid = { month: 10 } as any;
      expect(isCurrentPeriodPassed(invalid)).toBe(false);
    });

    it('should return false when month is missing', () => {
      const invalid = { name: 'October' } as any;
      expect(isCurrentPeriodPassed(invalid)).toBe(false);
    });

    it('should return false when both fields are null', () => {
      const invalid = { name: null, month: null } as any;
      expect(isCurrentPeriodPassed(invalid)).toBe(false);
    });

    it('should return true for undefined object with valid properties', () => {
      const period = { name: 'September', month: 9 };
      expect(isCurrentPeriodPassed(period)).toBe(true);
    });
  });
});
