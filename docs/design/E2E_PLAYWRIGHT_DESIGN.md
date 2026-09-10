# Playwright End-to-End Testing — Strategy & Structure Design

## 1. Goal

Add browser-level E2E coverage for Budgetery (Expo + expo-router, shipped as
static web via `expo export`) that proves **real user flows** from
`docs/design/usecases.md`, complementing the existing Jest unit suite
(`docs/test-plan.md`, `docs/TEST_COVERAGE_SUMMARY.md`).

Non-goals: replace Jest unit tests; test native iOS/Android shells
(Playwright targets the **web export only**); visual pixel diffing (deferred).

## 2. Folder decision

**Chosen: `e2e/` at repo root.**

| Candidate | Verdict |
|---|---|
| `e2e/` | ✅ **Chosen.** Playwright convention (`testDir` default is `tests`/`e2e`); clearly separated from Jest co-located `__tests__` / `*.test.tsx`; short import paths; matches `playwright.config.ts` at root. |
| `tests/e2e/` | Rejected. `tests/` reads as "all tests" and collides mentally with Jest `__tests__` dirs; deeper nesting for zero benefit. |
| `app/**/*.spec.ts` co-located | Rejected. Jest's default `testMatch` (`**/?(*.)+(spec\|test).[jt]s?(x)`) would pick up Playwright specs and crash the Jest worker (Playwright `test`/`expect` API ≠ Jest). Separation is mandatory. |
| `playwright/` | Rejected. Ambiguous with `playwright.config.ts` / `playwright-report/` artifacts. |

Resulting layout:

```text
playwright.config.ts          # single source of truth (baseURL, webServer, projects)
e2e/
  fixtures/
    test.ts                   # extended `test` with isolated storage state + navigation helpers
  helpers/
    selectors.ts              # canonical getByTestId map (mirrors TestID convention in AGENTS.md)
    flows.ts                  # reusable flows: completeWelcome, addIncome, addObligation, addExpense
  specs/
    onboarding.spec.ts        # Tutorial + month/period selection (usecases: Budget Management, Tutorial Onboarding)
    navigation.spec.ts        # Bottom navbar: income / obligations / expenses
    income.spec.ts            # Income Management usecases
    obligations.spec.ts       # Obligation Tracking usecases (incl. percentage switch)
    expenses.spec.ts          # Expense Tracking usecases (grouping, totals, remains)
    calculations.spec.ts      # Cross-screen recalculation (remaining / daily budget everywhere)
  data/
    periods.ts                # (optional later) canned period fixtures
```

Rules:

- **Only `*.spec.ts` inside `e2e/specs/` are Playwright tests.** Helpers/fixtures
  never use `.spec.` suffix so the runner ignores them.
- Jest must ignore `e2e/` via `testPathIgnorePatterns` (see §5) — otherwise
  `npx jest` tries to run Playwright specs.
- TypeScript `include` already covers `**/*.ts`, so no `tsconfig` change needed;
  `playwright.config.ts` is typechecked by `npx tsc --noEmit`.

## 3. Runtime & configuration

- **Runner:** `@playwright/test` (devDependency), Chromium-only project initially
  for speed; config is project-ready for Firefox/WebKit later.
- **Target:** static web export served locally — deterministic, no Metro dev-server
  flakiness:
  ```bash
  npm run e2e:build   # expo export --platform web --output-dir dist
  npm run e2e          # playwright test (webServer: npx serve dist -l 8081)
  ```
- **`playwright.config.ts` essentials:**
  - `testDir: 'e2e/specs'`, `baseURL: 'http://localhost:8081'`
  - `webServer: { command: 'npx -y serve dist -l 8081', url: 'http://localhost:8081', reuseExistingServer: !process.env.CI }`
    so a dev running `npx expo start --web --port 8081` gets reused automatically.
  - `forbidOnly: !!process.env.CI`, `retries: CI ? 2 : 0`, `workers: CI ? 1 : undefined`
  - `use: { trace: 'on-first-retry', screenshot: 'only-on-failure' }`, reporters `list` + `html`.
- **`.gitignore`:** `/test-results`, `/playwright-report` (dist/ already ignored).
- **npm scripts:** `e2e`, `e2e:ui`, `e2e:headed`, `e2e:build`, `e2e:report`.

## 4. Selector strategy (mandatory)

Per AGENTS.md TestID convention, **every interaction uses `page.getByTestId(...)`**.
`react-native-web` renders `testID` as `data-testid`, so selectors are stable
across snapshots — never use CSS/text/regex selectors or browser-mcp `sXeYZ` refs.
Canonical IDs live in `e2e/helpers/selectors.ts`:

| Area | testIDs |
|---|---|
| Welcome | `welcome-get-started`, `month-picker[-anchor/-option-N]`, `period-label-input`, `welcome-apply` (+`start-new-month-button`, `month-list`/`month-row-N`, `tutorial-progress` after a period exists) |
| Tabs | `tab-income`, `tab-obligations`, `tab-expenses` |
| Income | `income-empty(-action)`, `income-fab`, `income-row-0…`, `income-totals-bar(-total/-remaining/-daily/-remains)`, `income-projections` |
| Obligations | `obligations-empty(-action)`, `obligations-fab`, `obligations-row-0…`, `obligation-percentage-switch`, `obligation-recurring-switch`, `obligation-{amount,label,date}-input`, `obligations-totals-bar-*` |
| Expenses | `expenses-empty(-action)`, `expenses-fab`, `expenses-day-{yyyy-mm-dd}[-warned]`, `expenses-row-N`, `expenses-totals-bar(-total/-remains)` |
| Dialogs | `add-{income,obligation,expense}-dialog-action-save/back/delete`, `{income,obligation,expense}-{amount,label}-input`, `{income,obligation,expense}-date-input` |

If a flow needs a selector not in the map, **add the `testID` to app code first**
(AGENTS.md rule), then reference it — never fall back to fragile selectors.

## 5. Jest coexistence

- `jest.config.js` gains `testPathIgnorePatterns: ['/node_modules/', '/e2e/']`.
- Verify trio still passes: `npx tsc --noEmit`, `npx jest --silent --runInBand`,
  `npx expo export --platform web --output-dir dist`.

## 6. State isolation

The store persists via AsyncStorage → `localStorage` on web. Every spec starts
clean:

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});
```

This fixture lives in `e2e/fixtures/test.ts` so specs never duplicate it.
No authenticated sessions, no seeded backend — the app is fully client-side.

## 7. Scenario matrix (from `docs/design/usecases.md`)

### 7.1 `onboarding.spec.ts` — Tutorial Onboarding + period selection

| # | Usecase | Steps (testIDs) | Expect |
|---|---|---|---|
| O1 | First run shows tutorial, then income tab | `goto /` → `welcome-get-started` visible | Title "You don't have any data yet" |
| O2 | Complete welcome → month picker | click `welcome-get-started` → `month-picker-anchor` visible | Month prompt + `period-label-input` + `welcome-apply` |
| O3 | Select month + label → tabs | atomic menu select (`selectMenuOption`), fill `period-label-input`, click `welcome-apply` | URL `/tabs`, `tab-income/obligations/expenses` visible |
| O4 | New month → tutorial again | clear storage, reload `/` | Tutorial shown again (O1) |

Status (2026-09-10): all green headless, 3 consecutive runs. The Paper
Menu overlay auto-dismisses ~50–110ms after opening, so option selection
is done atomically in-page (`e2e/helpers/flows.ts selectMenuOption`;
clicks the real anchor + real option, ~10ms). Paper Dialogs stay mounted
while open — plain locator API is deterministic there
(`e2e/helpers/dialogs.ts fillAndSave`).

### 7.2 `navigation.spec.ts` — bottom navbar

| # | Usecase | Steps | Expect |
|---|---|---|---|
| N1 | Navigate via bottom bar | (after O3 setup) click `tab-obligations` → `tab-expenses` → `tab-income` | Each screen's empty/FAB marker visible (`obligations-empty`/`expenses-empty`/`income-empty` or list cards) |
| N2 | Bottom bar labels | assert all three tabs | income, obligations, expenses present |

### 7.3 `income.spec.ts` — Income Management

| # | Usecase | Steps | Expect |
|---|---|---|---|
| I1 | Add income via empty state | `income-empty-action` → fill `income-amount-input` + `income-label-input` → `add-income-dialog-action-save` | `income-row-0` appears; `income-totals-bar-total` shows total |
| I2 | Add second source, total = sum | `income-fab` → add → assert | Totals bar = amount₁ + amount₂ |
| I3 | Totals sticky on scroll | scroll list | `income-totals-bar` still intersects viewport (sticky bottom navbar) |
| I4 | Daily + remaining budget shown | assert | Bar contains Total / Remaining / Daily |

### 7.4 `obligations.spec.ts` — Obligation Tracking

| # | Usecase | Steps | Expect |
|---|---|---|---|
| B1 | Add fixed obligation | `obligations-fab` → fill `obligation-amount-input`/`obligation-label-input` (switch off) → save | `obligations-row-0` appears |
| B2 | Add percentage obligation | toggle `obligation-percentage-switch` on → save | Row appears; totals reflect % of total budget |
| B3 | No timestamps shown | assert | Rows contain no ISO date string |
| B4 | Daily + remaining recalculated | assert | Totals card shows daily budget + remaining |

### 7.5 `expenses.spec.ts` — Expense Tracking

| # | Usecase | Steps | Expect |
|---|---|---|---|
| E1 | Add expense, affects remains | `expenses-fab` (or empty action) → fill `expense-amount-input`/`expense-label-input` → save | `expenses-row-0` appears; totals bar total + remains updated |
| E2 | Grouped by day, expandable | add 2 expenses same day | Single `expenses-day-{today}` card with both entries + day total |
| E3 | Over-budget day highlighted | expense > daily budget | `expenses-day-{today}-warned` card visible (testID hook, no CSS asserts) |
| E4 | Totals sticky bottom | scroll | `expenses-totals-bar` pinned |

### 7.6 `calculations.spec.ts` — cross-screen consistency (State Management)

| # | Usecase | Steps | Expect |
|---|---|---|---|
| C1 | Expense reduces remains on all screens | seed income → add obligation → add expense | `income-totals-bar-remains`, obligations remains, `expenses-totals-bar-remains` all agree |
| C2 | Persistence across reload | seed data → wait for IndexedDB write → `page.reload()` | Rows + totals intact (IndexedDB on web; the save is async, so the spec polls the `Budgetery/budget_store` DB instead of reloading blindly) |

## 8. Initial scope (this change)

1. ✅ This design doc.
2. ✅ `playwright.config.ts` + `e2e/{fixtures,helpers,specs}/` skeleton.
3. ✅ `@playwright/test` devDependency + scripts + gitignore + Jest ignore.
4. ✅ O3/N1/N2 unblocked via atomic menu select (2026-09-10).
5. ✅ Full I/B/E/C suites implemented (2026-09-10): 20/20 green headless,
   3 consecutive runs. Helpers: `flows.ts` (`setupPeriod`,
   `selectMenuOption`), `dialogs.ts` (`fillAndSave`, `expectStickyBottom`).
6. ✅ CI workflow (`.github/workflows/e2e.yml`): `npm ci` → install
   chromium → `npm run e2e:build` → `npm run e2e`, report upload on failure.

Timeout policy: per-test `timeout: 15s`, `expect: 5s` — smoke specs assert in
seconds; failures surface fast instead of hanging 30s per locator.

Timeout policy: per-test `timeout: 15s`, `expect: 5s` — smoke specs assert in
seconds; failures surface fast instead of hanging 30s per locator.

## 9. Execution

```bash
npm install                       # picks up @playwright/test
npm run e2e:build                 # static export to dist/
npm run e2e                       # headless chromium, all specs
npm run e2e:ui                    # interactive UI mode (debug)
npm run e2e:report                # open HTML report
npx tsc --noEmit && npx jest --silent --runInBand   # unit gate unaffected
```
