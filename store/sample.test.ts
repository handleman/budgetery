import { calculateTotal, TOTAL_LENGTH } from './sample';

describe('calculateTotal', () => {
  it('should sum up item lengths', () => {
    expect(calculateTotal(['a', 'b', 'c'])).toBe(3);
  });
  
  it('should return initial length for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
