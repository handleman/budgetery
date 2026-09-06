// Mock context for testing - avoids circular dependencies in unit tests
import { Store, IncomeItem, ExpenseItem, ObligationItem, CurrentPeriod } from '../store/types';
import { TUTORIAL_NAMES } from '../store/enums';

export const createMockStore = (customValues?: Partial<Store>): Store => ({
  incomeTutorialPassed: false,
  obligationsTutorialPassed: false,
  expensesTutorialPassed: false,
  welcomeTutorialPassed: false,
  currentPeriod: { name: '', month: 0 },
  incomeItems: [],
  obligationItems: [],
  expenseItems: [],
  totalBudget: customValues?.totalBudget ?? 0,
  totalPercentageObligations: customValues?.totalPercentageObligations ?? 0,
  totalObligations: customValues?.totalObligations ?? 0,
  totalExpenses: customValues?.totalExpenses ?? 0,
  remainingBudget: customValues?.remainingBudget ?? 0,
  daylyBudget: customValues?.daylyBudget ?? 0,
  remains: customValues?.remains ?? 0,
});

export const createMockMutators = (): { [key: string]: (payload?: any) => void } => ({
  passIncomeTutorial: () => {},
  passObligationsTutorial: () => {},
  passExpensesTutorial: () => {},
  passWelcomeTutorial: () => {},
  setCurrentPeriod: (payload: CurrentPeriod) => {},
  addIncomeItem: (payload: IncomeItem) => {},
  addObligationItem: (payload: ObligationItem) => {},
  addExpenseItem: (payload: ExpenseItem) => {},
});

export const createMockContext = (): { store: Store; mutators: any } => ({
  store: createMockStore(),
  mutators: createMockMutators(),
});
