# Usecase Fulfillment — Gap Analysis & Screen-by-Screen Design Plan

Source of truth: `docs/design/usecases.md` vs codebase at `app/`, `store/`, `components/modal/`, `components/ui/`.
Date: 2026-09-07.

## 0. Summary verdict

| Area | Status |
|---|---|
| Bottom navbar (income/obligations/expenses) | DONE (`app/tabs/_layout.tsx` with `tab-income/tab-obligations/tab-expenses`) |
| Income add + totals | PARTIAL — works, but buggy + not sticky + no edit/delete/date |
| Obligations add + % + totals | PARTIAL — same + shows timestamps (explicitly unwanted) |
| Expenses add + totals | PARTIAL — flat list, no grouping, no edit/date, no overlap warning |
| Welcome / month select | PARTIAL — month+label pick, no validation, no month history |
| Tutorial flow (first run → income → default expenses → repeat on new month) | NOT DONE — 4 independent booleans, no sequencing, no per-month reset |
| Multi-month tracking + month list | NOT DONE — single `currentPeriod`, items never filtered by month |
| Sticky totals footer | NOT DONE on all 3 tabs (totals scroll away inside `ParallaxScrollView`) |
| Expense day-grouping + overlap warning algorithm | NOT DONE (biggest feature gap) |
| Tutorial progress checkboxes | NOT DONE |
| Persistence + calculations | PARTIAL — `PersistenceService` wired in `store/context.tsx`, but reducer chains miss `remains` updates; stale `useEffect` deps; `key={date.getMilliseconds()}` collisions |

Cross-cutting bugs found (fix first, block everything else):
1. `app/tabs/index.tsx:56-57`, `obligations.tsx:52-54` — `useEffect(..., [daylyBudgetValue])` self-dependency; never updates when store changes. Must be `[daylyBudget]`.
2. `store/reducer.ts:66-127` — `addIncomeItemReducer` never calls `remainsReducer`/`totalExpensesReducer`; `addObligationItemReducer` never updates `remains`. So `remains` goes stale after income/obligation adds. Chain must always end with `remainsReducer`.
3. `app/tabs/*.tsx:75,68,72` — `key={income.date.getMilliseconds()}` collides (0–999). Use `date.getTime()+index` or uuid.
4. `components/modal/*Modal.tsx:11-14` — `date` hardcoded to `new Date()`, `amount: Number(text)` accepts `NaN`, no validation, no reset after save.
5. `app/tabs/obligations.tsx:76` — shows `description={date.toISOString()}`; usecase explicitly says "i dont need to see timestamps".
6. `store/types.ts:29-31` — `!!value?.amount` rejects `amount: 0`; `isCurrentPeriodPassed` uses truthiness so `month: 0` fails. Use explicit `typeof === 'number'` checks.
7. `app/index.tsx:23,38-40` — Apply button active with no month selected; navigates to `/tabs` without guaranteeing period saved.

## 1. Global / Navigation / Tutorial / Multi-month (cross-screen)

### 1.1 What usecases demand
- Bottom bar with income, obligations, expenses; navigate by it.
- First run: tutorial → income tab. After tutorial passed, default tab = expenses.
- Starting a new month re-shows tutorial.
- Month list when >1 month tracked; selecting month scopes all calculations.

### 1.2 Current state
- Tabs exist and order is income/obligations/expenses. Default route `/tabs` → `index` (income). No "default to expenses after tutorial" logic.
- Welcome screen (`app/index.tsx`): `welcomeTutorialPassed` gate → month picker + label → `setCurrentPeriod` in `useEffect` → `router.navigate('/tabs')`.
- Tutorial flags are 4 global booleans in `Store`, never reset, never per-period. No checkbox progress UI.

### 1.3 Plan
**Step G1 — Routing + default tab (small):**
- In `app/tabs/_layout.tsx` keep tab order. Add redirect: if `welcomeTutorialPassed && incomeTutorialPassed && obligationsTutorialPassed && expensesTutorialPassed` → initial route `expenses`, else `index`. Implement via `router.replace` guard in `app/tabs/index.tsx` or a `app/tabs/_layout.tsx` hook reading `appContext`. Simpler: `index.tsx` effect: if all tutorials passed → `router.replace('/tabs/expenses')`.
- After welcome Apply → `router.replace('/tabs')` with explicit "income first" when income tutorial not passed, else expenses. Remove bare `navigate`.
- testIDs: keep `tab-income/tab-obligations/tab-expenses`; add `welcome-apply` already exists, add disabled state.

**Step G2 — Welcome validation (small):**
- Disable `welcome-apply` until `selectedMonth != null && selectedPeriodName.trim() !== ''`. Remove `useEffect`-save side effect; save synchronously in `savePeriodHandler` before navigation (avoids race where navigation happens before dispatch).
- testID: `welcome-apply`, `month-picker`, `period-label-input` (exist).

**Step G3 — Multi-month model (medium, prerequisite for everything):**
- `store/types.ts`: add `PeriodRecord { id: string; name: string; month: number; year: number }`; change `Store` to `{ periods: PeriodRecord[]; currentPeriodId: string | null; ... }` OR keep `currentPeriod` + add `periods: CurrentPeriod[]`. Prefer minimal: add `periods: CurrentPeriod[]` + `currentPeriod` stays as selected. Add `ACTION_TYPES.SET_PERIOD_LIST / SELECT_PERIOD / START_NEW_MONTH`.
- `START_NEW_MONTH` semantics: push current period snapshot to `periods`, reset `incomeItems/obligationItems/expenseItems` (or scope items by `periodId` — decision needed; simplest v1: archive totals per period, start empty lists, reset 3 tab-tutorial flags but keep `welcomeTutorialPassed=true` so only tab tutorials re-show).
- New UI: `MonthListScreen` or section on Welcome screen: if `periods.length > 0`, render list `month-row-{index}` with tap → `setCurrentPeriod` + `router.replace('/tabs/expenses')`. This satisfies "see list of months where i was tracking".
- Persistence: extend `store/persistence/*` serialization + migration `v1→v2` adding `periods: []`.
- Acceptance: create 2 months → list shows 2 → switching month shows that month's totals (v1: archived snapshot totals; v2: full per-period item scoping).

**Step G4 — Tutorial progress with checkboxes (small-medium):**
- New component `components/tutorial/TutorialProgress.tsx` (`testID="tutorial-progress"`, checkboxes `tutorial-check-welcome/income/obligations/expenses`): reads 4 flags, renders checklist + "Continue → next unpassed module" button that routes to the right screen.
- Embed on Welcome screen (post-tutorial state) and on each tab's empty state. Replaces ad-hoc `HelloWave`-only empty states; keep `AppEmptyState` but add progress component above it.
- "New month re-shows tutorial": `START_NEW_MONTH` resets `income/obligations/expensesTutorialPassed=false` (keep welcome=true). Empty states reappear naturally.

## 2. Screen 1 — Welcome (`app/index.tsx`)

Usecases: set monthly budget amount → tracking dashboard; select month → relevant calculations; first-run tutorial.
- DONE: month picker, label input, get-started gate.
- GAP: no amount input (totalBudget is derived from income sum — usecase "set my monthly budget amount" is currently only satisfiable via income; decide: keep derived model and clarify, or add explicit budget override); no validation; no month history; no tutorial checklist.
- Plan:
  1. Fix G2 validation + synchronous save.
  2. Add `TutorialProgress` + month list (G3/G4) below the picker when `periods.length>0`.
  3. Decided: derived budget only — no monthly target field. Welcome copy must say budget = income sum.
- Acceptance: fresh install → Get started → pick month+label → Apply enabled only when valid → lands on income (first run) → relaunch skips Get started.

## 3. Screen 2 — Income (`app/tabs/index.tsx` + `AddIncomeModal`)

Usecases: multiple sources + combined total; salary dates + projections; totals: total income, daily budget, remaining (total−obligations); sticky bottom totals.
- DONE: list card, totals card (total/remaining/daily), FAB `income-fab`, modal with amount+label.
- GAPS / BUGS:
  - Totals scroll away; not sticky.
  - No date input (always today) → "salary dates + projections" impossible.
  - No edit/delete.
  - Stale `daylyBudget` effect; colliding keys; shows raw ISO dates; `income-row-{i}` exists but no actions.
- Plan:
  1. **Bugfix pass (P0):** fix effect dep to `[daylyBudget]`; key → `${date.getTime()}-${index}`; hide or humanize date (`toLocaleDateString`, keep date since income needs dates); guard `NaN` amounts in modal; reset modal fields on close.
  2. **Sticky footer (P0, shared pattern):** extract `components/ui/StickyTotalsBar.tsx` (`testID="income-totals-bar"`): `Total | Remaining | Daily`. Render OUTSIDE `ParallaxScrollView` (sibling view with `position: sticky` on web / absolute bottom on native). Move totals out of scroll content on all 3 tabs. Keep list card inside scroll. FAB stays (`income-fab`).
  3. **Date support (P1):** add date field to `AddIncomeModal` (default today, allow past dates in current month; native `DateTimePicker` + web `<input type="date">` via `AppDateInput` adapter). Store real date. Row shows `label — amount` + `description=date short`.
  4. **Edit/delete (P2):** add `UPDATE_INCOME / REMOVE_INCOME` actions + row swipe/long-press → edit modal prefilled, delete confirm (`add-income-dialog-action-save` pattern already via `AppDialog`). Defer if scope-tight; at minimum add delete.
  5. **Salary projections (M6, date-pattern):** `store/projections.ts` groups prior-period income by `label` → `{ label, avgAmount, modalDay, occurrences }`; `IncomeProjections` card lists expected items for current month. Requires `periodId` isolation (M6) first.
- Acceptance: add 2 incomes → total = sum; add obligation → remaining on income screen drops; daily = remaining/daysInMonth; footer visible at scroll bottom; reload persists.

## 4. Screen 3 — Obligations (`app/tabs/obligations.tsx` + `AddObligationModal`)

Usecases: recurring obligations + total; % -based calculated from total budget; daily + remaining; list + summary; NO timestamps; sticky totals.
- DONE: list, % switch `obligation-percentage-switch`, totals, FAB.
- GAPS: timestamps shown (violates usecase); no recurrence; same sticky/effect/key/modal bugs as income; % semantics (percent of totalBudget) implemented in `totalPercentageObligationsReducer` but order-dependent (income must be added before % obligation to be correct; adding income later does NOT recompute % obligations — chain in `addIncomeItemReducer` recomputes % so OK, but adding plain obligation after % one skips `%` recompute — actually correct since % base unchanged; verify with test).
- Plan:
  1. **P0 bugfix:** same effect/key/NaN fixes; REMOVE `description={date.toISOString()}` → show `amount (+ % resolved)` only, e.g. title `Rent — 500`, subtitle `10% of 5000 = 500` when `isPercentage`. Keep date in store (needed for sorting) but don't render.
  2. Sticky footer `obligations-totals-bar` (Total obligations | Remaining | Daily) outside scroll.
  3. **Recurrence (P1):** add `isRecurring` or `recurrence: 'monthly'|null` to `ObligationItem` + modal checkbox/switch (`obligation-recurring-switch`); `START_NEW_MONTH` auto-carries recurring obligations into new month. Without this, "recurring" usecase is unmet.
  4. Edit/delete same as income (P2).
- Acceptance: add fixed 300 + 10% with totalBudget 5000 → total 800; remaining = 4200; no dates visible; footer sticky; recurring item survives new-month start.

## 5. Screen 4 — Expenses (`app/tabs/expenses.tsx` + `AddExpenseModal`) — largest gap

Usecases: period list + visual summary; set expense+label; group by day expandable cards; add/edit default today, allow past days; over-budget day card pale-red; overlap accent propagates `ceil(big_expense/day_budget)` days forward, accumulates with new expenses; normal card after overlap expires; remaining recalculated everywhere; total+remains summary below day cards, STICKED as bottom navbar.
- DONE: flat list, add modal, totals card (remains/total), FAB, empty state.
- NOT DONE: everything distinctive (grouping, edit/date, overlap algorithm, sticky).
- Plan (phased):
  1. **P0 bugfix + sticky:** same key/NaN fixes; move totals to `expenses-totals-bar` (Total expenses | Remains) sticky outside scroll.
  2. **P1 — Day grouping + edit/date (prerequisite for overlap):**
     - Selector `groupExpensesByDay(expenseItems): DayGroup { dayKey: yyyy-mm-dd; total: number; items: ExpenseItem[] }[]` sorted desc. New `components/expenses/ExpenseDayCard.tsx` (`testID="expenses-day-{dayKey}"`, expandable via `Collapsible` or Paper Accordion, header `date + day total + count`, body rows `expenses-row-{i}`).
     - Modal: add date input default today, max today, allow past within current month (`expense-date-input`); support comma-separated multi-entry ("several values in a row, separated by comma") — parse `label` or `amount` CSV into N items same day (existing empty-state copy promises this; implement amount CSV split).
     - Edit: `UPDATE_EXPENSE / REMOVE_EXPENSE`; tapping row opens prefilled modal (`expense-edit-{index}`); date editable.
  3. **P2 — Overlap warning algorithm (core new logic, put in `store/expensesOverlap.ts` + unit tests):**
     - Inputs: `dayGroups, daylyBudget`. Rule: for each day with `dayTotal > daylyBudget`, `overrun = dayTotal - daylyBudget` (or `big_expense` = day total per usecase text; decide: use day total; document). `spread = ceil(overrun / daylyBudget)` (usecase formula `big_expense/day_budget`, use ceil, min 1). Mark that day + next `spread` calendar days as `warned` (`isOverlapped: boolean`, `overlapSourceDay`).
     - Accumulation: if new expense lands inside an active warning window, add to `overrun` and extend window from that day.
     - After window expires → normal card.
     - Rendering: warned `ExpenseDayCard` gets pale-red background from theme (`theme.colors.errorContainer` / custom accent, dark+light safe) + `testID` suffix `-warned` + accessibility label. Pure function → easily tested: cases single big expense, accumulation, expiry, no-budget (daylyBudget 0 → no warnings).
     - Remaining recalculation already via `remainsReducer`; ensure income/obligation screens also display `remains` OR document that remains lives only on expenses (usecase says "recalculated on all related screens" — add `remains` line to sticky bars on income/obligations too, cheap).
  4. **Visual summary: NUMERIC ONLY (decided).** Day totals + sticky total/remains bars satisfy the usecase. No chart library.
- Acceptance: add expense > daily → day card pale-red + next N days warned; expense after window → normal; totals sticky; edit past day works; reload persists.

## 6. State / Store / Persistence (cross-cutting)

- DONE: `PersistenceService` + hydrate/save in `context.tsx`, typed routes regeneration noted in AGENTS.md.
- TODO:
  1. Fix reducer chains to always recompute `remains` (append `remainsReducer` in income/obligation paths) + add regression tests in `store/reducer.test.ts` (income→remains, obligation→remains, % math).
  2. Harden type guards (`amount === 0` valid; `month: 0` vs 1-indexed months 1–12 — standardize; `monthNames` values 1–12 vs `defaultStore.month: 0` sentinel OK).
  3. Add `UPDATE_*/REMOVE_*/SELECT_PERIOD/START_NEW_MONTH` actions + migrations (`store/migrations.ts` extend to v2: `periods`, `isRecurring`).
  4. Replace local `useState` mirrors of store values in tab screens with direct `ctx.store` reads (or fix deps) — current mirror pattern causes stale UI; simplest: drop `total/remaining/dayly` local states, render `ctx.store.*` directly.
  5. Verify per AGENTS.md before commit: `npx tsc --noEmit && npx jest --silent --runInBand && npx expo export --platform web --output-dir dist`, then re-run tsc (typed routes).

## 7. Suggested build order (milestones)

- **M1 Correctness (0.5–1d):** §0 bugs (effects, keys, guards, remains chain, welcome validation, hide obligation dates). Tests: reducer + guard updates. Exit: existing suite green, totals correct cross-screen.
- **M2 Sticky footers + shared UI (0.5d):** `StickyTotalsBar`, move totals out of scroll on 3 tabs, add `remains` to income/obligation bars. E2E: footer visible after scroll.
- **M3 Tutorial + routing (0.5–1d):** default-to-expenses redirect, `TutorialProgress` checklist, new-month flag reset (without full multi-month yet: a "Start new month" button that archives label to `periods` + resets lists/flags).
- **M4 Expenses grouping + date/edit + CSV (1–2d):** selector, `ExpenseDayCard` expandable, modal date input, update/remove actions.
- **M5 Overlap warnings (1d):** `expensesOverlap.ts` + warned styling + tests.
- **M6 Multi-month full + recurrence + projections (1–2d):** per-period isolation (`periodId` on items, `periods[]`, `SELECT_PERIOD`/`START_NEW_MONTH`), recurring obligations carry-over, date-pattern income projections (`store/projections.ts`), numeric summaries only.
- **M7 Polish:** visual summary, empty-state copy alignment, Playwright E2E per AGENTS.md hybrid protocol (navigate → snapshot → interact via `data-testid`), docs update.

## 8. Decisions (resolved 2026-09-07)
1. Budget model: **KEEP DERIVED** (`totalBudget = Σ income`). No explicit monthly target field. Welcome "budget amount" = income sum; docs updated to reflect this.
2. Multi-month: **FULL PER-PERIOD ITEM ISOLATION**. Every `IncomeItem/ObligationItem/ExpenseItem` gets `periodId: string`. `Store.periods: PeriodRecord[]`, `Store.currentPeriodId: string | null`. All selectors filter by `currentPeriodId`. `START_NEW_MONTH` creates new period, switches to it (old items retained, lists appear empty). `SELECT_PERIOD` switches. Migration v1→v2 backfills `periodId` from legacy `currentPeriod` + creates initial period.
3. Overlap formula: **LATTER** — `spread = ceil((dayTotal − daylyBudget) / daylyBudget)`, min 1 when over. Only the overrun spreads forward. Accumulates when new expense lands inside active window.
4. Salary projections: **DATE PATTERN**. Projection engine groups prior periods' income by `label`, computes avg amount + modal day-of-month, lists "expected" items for current month (`components/income/IncomeProjections.tsx`, `store/projections.ts`). No `isRecurring` flag on income.
5. Visual summary: **NUMERIC ONLY**. No chart lib. Totals bars + day totals satisfy "visual summary".

## 9. TestID additions (required by repo convention)
`income-totals-bar`, `obligations-totals-bar`, `expenses-totals-bar`, `expenses-day-{yyyy-mm-dd}` (+`-warned`), `expense-date-input`, `income-date-input`, `obligation-recurring-switch`, `tutorial-progress`, `tutorial-check-{welcome,income,obligations,expenses}`, `month-row-{index}`, `month-list`, `start-new-month-button`.
