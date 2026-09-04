// Sample store file that will be protected during test writing
export function calculateTotal(items: string[]): number {
  return items.reduce((sum, item) => sum + item.length, 0);
}

export const TOTAL_LENGTH = 10;
