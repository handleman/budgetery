# Budgetery - Comprehensive Unit Test Plan

This document outlines all components requiring unit tests, organized by priority and functionality.

---

## 🔴 HIGH PRIORITY - Core Business Logic

### 1. Store Reducer Functions
**File**: `store/reducer.ts`  
**Priority**: HIGH  
**Coverage Needed**: All reducer functions in the `appReducer` switch statement

#### Components to Test:

##### Tutorial Pass Handlers (4 test cases per tutorial)
- [`PASS_TUTORIAL`](file:///Users/handleman/projects/budgetery/store/enums.ts#7-L8) action triggers
  - `passIncomeTutorial` → `incomeTutorialPassed = true`
  - `passObligationsTutorial` → `obligationsTutorialPassed = true`
  - `passExpensesTutorial` → `expensesTutorialPassed = true`
  - `passWelcomeTutorial` → `welcomeTutorialPassed = true`
- Edge cases: null/undefined payload

##### Budget Calculators
- [`totalBudgetReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#58-L65) - Sums all income items
- [`totalExpensesReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#106-L113) - Sums expense amounts
- [`totalPercentageObligationsReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#39-L47) - Calculates percentage-based obligations
- [`totalObligationsReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#48-L56) - Combines plain + percentage obligations

##### Remainder Calculators
- [`remainingBudgetReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#31-L37) - totalBudget - totalObligations
- [`remainsReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#5-L11) - remainingBudget - totalExpenses

##### Daily Budget Calculator
- [`daylyBudgetReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#13-L23) - remainingBudget / daysInPeriod
- Edge case: Division by zero when month has 0 days

##### Period Management
- [`currentPeriodReducer`](file:///Users/handleman_projects/budgetery/store/reducer.ts#25-L30) - Sets current period date/range

##### Item Adders (Complex Chains)
- [`addIncomeItemReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#66-L79) - Adds income + recalculates all totals (priority chain order matters!)
- [`addObligationItemReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#81-L104) - Adds obligation with different calculation paths based on `isPercentage`
- [`addExpenseItemReducer`](file:///Users/handleman/projects/budgetery/store/reducer.ts#115-L125) - Adds expense + recalculates remain/expenses

---

### 2. Validation Guards (Type Predicates)
**File**: `store/types.ts`  
**Priority**: HIGH  
**Coverage Needed**: All predicate functions with invalid payloads

#### Components to Test:

##### [`isIncomeItemPassed`](file:///Users/handleman/projects/budgetery/store/types.ts#28-L33)
```typescript
export function isIncomeItemPassed(value): value is IncomeItem
```
Test Cases:
- Valid item (date, amount, label all present)
- Missing date → returns false
- Amount not a number → returns false
- Label not a string → returns false

##### [`isExpenseItemPassed`](file:///Users/handleman/projects/budgetery/store/types.ts#35-L40)
```typescript
export function isExpenseItemPassed(value): value is ExpenseItem
```
Same validation tests as income (no `isPercentage` field needed)

##### [`isObligationItemPassed`](file:///Users/handleman/projects/budgetery/store/types.ts#43-L49)
```typescript
export function isObligationItemPassed(value): value is ObligationItem
```
Test Cases:
- All fields valid including `isPercentage`
- Missing `isPercentage` → returns false
- `isPercentage` not boolean → returns false

##### [`isCurrentPeriodPassed`](file:///Users/handleman/projects/budgetery/store/types.ts#51-L55)
```typescript
export function isCurrentPeriodPassed(value): value is CurrentPeriod
```
Test Cases:
- Name and month both present → true
- Missing name → false
- Missing month → false

---

### 3. Context Mutators
**File**: `store/context.tsx`  
**Priority**: HIGH  
**Coverage Needed**: All mutator functions dispatch proper actions

#### Components to Test:

##### Tutorial Mutators
- [`passIncomeTutorial()`](file:///Users/handleman/projects/budgetery/store/context.tsx#48-L50) → dispatches `PASS_TUTORIAL(income)`
- [`passObligationsTutorial()`](file:///Users/handleman/projects/budgetery/store/context.tsx#51-L53) → dispatches `PASS_TUTORIAL(obligations)`
- [`passExpensesTutorial()`](file:///Users/handleman_projects/budgetery/store/context.tsx#54-L56) → dispatches `PASS_TUTORIAL(expenses)`
- [`passWelcomeTutorial()`](file:///Users/handleman/projects/budgetery/store/context.tsx#57-L59) → dispatches `PASS_TUTORIAL(welcome)`

##### Item Mutators
- [`addIncomeItem(passed: IncomeItem)`](file:///Users/handleman/projects/budgetery/store/context.tsx#63-L65) → dispatches `ADD_INCOME(incomeItem)`
- [`addToObligationItem(passed: ObligationItem)`](file:///Users/handleman_projects/budgetery/store/context.tsx#66-L68) → dispatches `ADD_OBLIGATION(obligationItem)`  
- [`addExpenseItem(passed: ExpenseItem)`](file:///Users/handleman/projects/budgetery/store/context.tsx#69-L71) → dispatches `ADD_EXPENSE(expenseItem)`

##### System Mutators
- [`setCurrentPeriod()`](file:///Users/handleman_projects/budgetery/store/context.tsx#60-L62) → dispatches `ADD_PERIOD(period)`

---

## 🟡 MEDIUM PRIORITY - UI Components with Logic

### 4. Tab Screen Components
**Files**: 
- `app/tabs/index.tsx` (Income Screen)
- `app/tabs/obligations.tsx` (Obligations Screen)
- `app/tabs/expenses.tsx` (Expenses Screen)  
**Priority**: MEDIUM

#### Components to Test:

##### Common Tests for All Screens:
1. **Tutorial Flow Completion** → Modal visible, list populated
2. **Modal Visibility Logic** - `[isModalVisible](file:///Users/handleman/projects/budgetery/app/tabs/index.tsx#19-L19)` state transitions
3. **State Synchronization** - useEffect hooks sync local state with context:
   - `setIncomes(incomeItems)`
   - `setObligations(obligationItems)`
   - `setExpenses(expenseItems)`
4. **Remaining Budget Updates** - Reflect changes immediately after adding items

##### Income Screen Specific Tests (`index.tsx`)
- Button: `"Get started!"` → tutorial passed, modal opens
- Button: `"Add more!"` → modal opens without changing tutorial state
- useEffect: `incomeItems` updates when dispatched
- useEffect: `totalBudget`, `remainingBudget`, `daylyBudget` values update

##### Obligations Screen Specific Tests (`obligations.tsx`)
- Button: `"Get started!"` → tutorial passed, modal opens with isPercentage UI
- Button: `"Add more!"` → modal opens
- Percentage obligations should show in list after adding

##### Expenses Screen Specific Tests (`expenses.tsx`)
- Button: `"Add one!"` → tutorial passed, modal opens
- Button: `"Add more!"` → modal opens
- useEffect: `expenseItems`, `remains`, `totalExpenses` sync up

---

### 5. Modal Components
**Files**: 
- `components/modal/AddIncomeModal.tsx`
- `components/modal/AddObligationModal.tsx`
- `components/modal/AddExpenseModal.tsx`  
**Priority**: MEDIUM

#### Components to Test:

##### Common Tests for All Modals:
1. `[isVisible](file:///Users/handleman/projects/budgetery/components/modal/AddIncomeModal.tsx#8-L8)` prop controls render state
2. `onClose` callback fires on cancel button click
3. `onSubmit` dispatches to context and calls `onClose`

##### AddIncomeModal Specific Tests
- Amount input: numeric keyboard → sets value correctly
- Label input: text → setLabel called
- Save button: validates data, creates item with current date
- Cancel button: only closes modal (doesn't submit)
- Date automatically set to new Date() on save

##### AddObligationModal Specific Tests
**Additional Complexity**: `isPercentage` Toggle Switch
1. **[isPercentage](file:///Users/handleman/projects/budgetery/components/modal/AddObligationModal.tsx#29-L29)** switch starts at false
2. Toggle changes value → [SetIsPercentage(file:///Users/handleman_projects/budgetery/components/modal/AddObligationModal.tsx#19-L23)](file:///Users/handleman/projects/budgetery/components/modal/AddObligationModal.tsx#19-L23) fires
3. Save button respects `isPercentage` in created payload
4. Switch UI state syncs with variable value

##### AddExpenseModal Specific Tests
- Simpler than obligation modal (no percentage switch)
- Same structure as income modal

---

### 6. Shared Components
**Files**: 
- `components/Hr.tsx`
- `components/ThemedText.tsx`  
- `components/ThemedView.tsx`
- `components/HelloWave.tsx`  
**Priority**: MEDIUM (can be snapshot tested or mocked)

#### Components to Test:

##### Hr Component (`Hr.tsx`)
- Renders border-bottom style correctly
- Empty component, just styles

##### ThemedText Component (`ThemedText.tsx`)
- Color from context based on theme (light/dark)
- Different fonts for each `type` variant:
  - Default: fontSize 16, lineHeight 24
  - Title: fontSize 32, fontWeight bold
  - DefaultSemiBold: fontSize 16, fontWeight 600
  - Subtitle: fontSize 20, fontWeight bold
  - Link: color #0a7ea4
- Props forwarded correctly to `<Text>`

##### ThemedView Component (`ThemedView.tsx`)
- Background color from context based on theme
- `backgroundColor` + user-provided `style` merged

##### HelloWave Component (`HelloWave.tsx`)
- Animation runs 4 times as specified
- Rotates between 0 and 25 degrees
- Uses reanimated timing sequences

---

## 🟢 LOW PRIORITY - Utilities & Constants

### 7. Hook Functions
**Files**: 
- `hooks/useColorScheme.ts` (delegates to RN)
- `hooks/useThemeColor.ts`  
**Priority**: LOW - Can be tested via snapshot testing with Jest

#### Components to Test:

##### useThemeColor Hook (`useThemeColor.ts`)
1. Default theme is 'light' when scheme undefined
2. Props [light/dark](file:///Users/handleman/projects/budgetery/constants/Colors.ts#18-L25) returned when provided
3. Falls back to `Colors[theme][colorName]` when undefined
4. Test both iOS and Android theme detection

---

### 8. Color Constants  
**File**: `constants/Colors.ts`  
**Priority**: LOW  

#### Components to Test:
- Verify both light and dark color schemes exist
- Verify all required keys present: text, background, tint, icon, tabIconDefault, tabIconSelected

---

## 📋 Test Files to Create

### 1. Core Store Tests
```bash
create /Users/handleman/projects/budgetery/store/reducer.test.ts
create /Users/handleman/projects/budgetery/store/types.test.ts
create /Users/handleman/projects/budgetery/store/context.test.tsx
```

### 2. Modal Component Tests
```bash
create /Users/handleman/projects/budgetery/components/modal/AddIncomeModal.test.tsx
create /Users/handleman/projects/budgetery/components/modal/AddObligationModal.test.tsx
create /Users/handleman_projects/budgetery/components/modal/AddExpenseModal.test.tsx
```

### 3. Tab Screen Tests
```bash
create /Users/handleman/projects/budgetery/app/tabs/income.test.tsx
create /Users/handleman/projects/budgetery/app/tabs/obligations.test.tsx
create /Users/handleman_projects/budgetery/app/tabs/expenses.test.tsx
```

### 4. Shared Component Tests
```bash
create /Users/handleman/projects/budgetery/components/Hr.test.tsx
create /Users/handleman_projects/budgetery/components/ThemedText.test.tsx (already exists)
create /Users/handleman/projects/budgetery/components/ThemedView.test.tsx
create /Users/handleman_projects/budgetery/components/HelloWave.test.tsx (skip - reanimated tests complex)
```

### 5. Hook Tests  
```bash
create /Users/handleman/projects/budgetery/hooks/useThemeColor.test.tsx
# useColorScheme uses RN APIs, skip or mock
```

---

## 🧪 Testing Framework Notes

- **Framework**: Jest + React Native Testing Library (`react-test-renderer`)
- Already configured: `components/__tests__/ThemedText-test.tsx`
- Need: Add more test directories per convention
- Snapshots: Used for UI component rendering tests
- Mock: Context providers in tests (can use `@testing-library/react-native` for better React Native testing)

---

## 📝 Summary Table

| File | Priority | Lines | Test Coverage Gap |
|------|----------|-------|------------------|
| store/reducer.ts | HIGH | 165 | ~140 lines (all reducers) |
| store/types.ts | HIGH | 92 | All type guards + Store context |
| store/context.tsx | HIGH | 94 | All 7 mutator functions |
| app/tabs/index.tsx | MEDIUM | 143 | Tutorial flow, state synch |
| app/tabs/obligations.tsx | MEDIUM | 142 | Same as income + percentage check |
| app/tabs/expenses.tsx | MEDIUM | 131 | Same structure |
| AddIncomeModal.tsx | MEDIUM | 74 | All inputs, save/cancel flows |
| AddObligationModal.tsx | MEDIUM | 94 | Toggle logic + all inputs |
| AddExpenseModal.tsx | MEDIUM | 74 | Basic inputs + submit |
| ThemedText.tsx | MEDIUM | 60 | Font variants, theming |
| ThemedView.tsx | MEDIUM | 14 | Theme colors |
| Hr.tsx | LOW | 16 | Render test |
| HelloWave.tsx | LOW | 37 | Animation (skip or advanced) |
| useThemeColor.ts | LOW | 22 | Theme fallback logic |
| Constants/Colors.ts | LOW | 26 | Keys enumeration |

---

END OF TEST PLAN
