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
| Welcome | `welcome-get-started`, `month-picker`, `period-label-input`, `welcome-apply` |
| Tabs | `tab-income`, `tab-obligations`, `tab-expenses` |
| Income | `income-empty`, `income-empty-action`, `income-fab`, `income-row-0…`, `income-totals-card` |
| Obligations | `obligations-empty(-action)`, `obligations-fab`, `obligations-row-0…`, `obligation-percentage-switch`, `obligation-amount-input`, `obligation-label-input` |
| Expenses | `expenses-empty(-action)`, `expenses-fab`, `expenses-row-0…`, `expenses-totals-card` |
| Dialogs | `add-{income,obligation,expense}-dialog-action-save/back`, `{income,obligation,expense}-{amount,label}-input` |

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
| O2 | Complete welcome → month picker | click `welcome-get-started` → `month-picker` visible | Month prompt + `period-label-input` + `welcome-apply` |
| O3 | Select month + label → tabs | pick month via `month-picker`, fill `period-label-input`, click `welcome-apply` | URL `/tabs`, `tab-income/obligations/expenses` visible |
| O4 | New month → tutorial again | clear storage, reload `/` | Tutorial shown again (O1) |

### 7.2 `navigation.spec.ts` — bottom navbar

| # | Usecase | Steps | Expect |
|---|---|---|---|
| N1 | Navigate via bottom bar | (after O3 setup) click `tab-obligations` → `tab-expenses` → `tab-income` | Each screen's empty/FAB marker visible (`obligations-empty`/`expenses-empty`/`income-empty` or list cards) |
| N2 | Bottom bar labels | assert all three tabs | income, obligations, expenses present |

### 7.3 `income.spec.ts` — Income Management

| # | Usecase | Steps | Expect |
|---|---|---|---|
| I1 | Add income via empty state | `income-empty-action` → fill `income-amount-input` + `income-label-input` → `add-income-dialog-action-save` | `income-row-0` appears; `income-totals-card` shows total |
| I2 | Add second source, total = sum | `income-fab` → add → assert | Totals card = amount₁ + amount₂ |
| I3 | Totals sticky on scroll | scroll list | `income-totals-card` still visible (sticky bottom navbar) |
| I4 | Daily + remaining budget shown | assert | `income-totals-card` contains Total / Remaining / Daily |

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
| E1 | Add expense, affects remains | `expenses-fab` (or empty action) → fill `expense-amount-input`/`expense-label-input` → save | `expenses-row-0` appears; `expenses-totals-card` total + remains updated |
| E2 | Grouped by day, expandable | add 2 expenses same day | Single day card with both entries |
| E3 | Over-budget day highlighted | expense > daily budget | Day card gets warning styling (accent class) |
| E4 | Totals sticky bottom | scroll | `expenses-totals-card` pinned |

### 7.6 `calculations.spec.ts` — cross-screen consistency (State Management)

| # | Usecase | Steps | Expect |
|---|---|---|---|
| C1 | Expense reduces remains on all screens | seed income → add obligation → add expense | `income-totals-card`, obligations totals, `expenses-totals-card` all agree on remains |
| C2 | Persistence across reload | seed data → `page.reload()` | Rows + totals intact (AsyncStorage) |

## 8. Initial scope (this change)

1. ✅ This design doc.
2. ✅ `playwright.config.ts` + `e2e/{fixtures,helpers,specs}/` skeleton.
   Active smoke specs: O1, O2, O4 (tutorial visible / picker revealed /
   tutorial repeats). Green headless.
3. ✅ `@playwright/test` devDependency + scripts + gitignore + Jest ignore.
4. ⏸️ Skipped until automation-ready: O3, N1, N2 (`test.skip`/`describe.skip`
   with reason in code). Finding (2026-09-07): the month-picker flow itself
   works — verified manually in a healthy browser (select September → label
   autofills → Apply → `/tabs` with all three tabs). But the headless runner
   cannot drive the Paper Menu overlay reliably: the menu auto-closes
   ~50–110ms after opening with no input/resize/remount observed, and its
   entrance animation never reports "stable", so option clicks time out
   (normal, force, and synthetic alike). Re-enable when the overlay is
   automation-ready (e.g. animation settles deterministically headless).
5. ⏳ Full I/B/E/C suites (7.3–7.6): `.skip` placeholders referencing this doc,
   implemented in follow-ups once dialog/menu web behavior is confirmed.
6. ⏳ CI workflow (`.github/workflows/e2e.yml`): `npm ci` → `npx playwright install
   chromium` → `npm run e2e:build` → `npm run e2e` — left for the CI change.

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
