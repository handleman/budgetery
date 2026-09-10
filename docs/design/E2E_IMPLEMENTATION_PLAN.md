# E2E Remaining Work — Implementation Plan

> Status 2026-09-10: ALL PHASES COMPLETE — 20/20 green headless ×3 runs.
> Phase A unblocked via atomic in-page menu select (round-trip latency was
> the whole blocker). I/B/E/C implemented against current testIDs
> (`*-totals-bar`, `expenses-day-*[-warned]`). Phase F workflow added.
> Kept below as implementation record.

Parent strategy: `docs/design/E2E_PLAYWRIGHT_DESIGN.md`.
Current state: O1/O2/O4 green headless; O3/N1/N2 skipped (menu overlay);
I/B/E/C suites are `.skip` placeholders; no CI workflow yet.

Work in phases, one branch per phase. Each phase must end green:
`npx tsc --noEmit`, `npx jest --silent --runInBand`,
`npm run e2e:build && npm run e2e`.

## Phase A — Unblock O3/N1/N2 (menu overlay automation)

Goal: re-enable `O3: select month + label navigates to tabs`, `N1`, `N2`.

Known blocker: Paper Menu overlay auto-closes ~50–110ms after opening and its
entrance animation never reports "stable" under headless Chromium, so option
clicks time out (normal, force, and synthetic alike). The feature itself works
(verified manually: select → label autofill → Apply → `/tabs`).

Try in order, stop at first green (3 consecutive local runs + CI):

1. **Keyboard selection** — focus `month-picker-anchor`, `Enter`, arrow to
   September, `Enter`. No pointer-stability dependency.
   Files: `e2e/helpers/flows.ts` only.
2. **Bounded retry loop** — open menu → `waitFor attached` → force-click →
   confirm via anchor text (`September`); retry ≤5. Masks flakes but fails
   loudly if selection is truly broken.
   Files: `e2e/helpers/flows.ts` only.
3. **Reduced-motion (needs source-edit permission per test-guardian)** — set
   `theme.animation.scale = 0` in `PaperProvider` when
   `matchMedia('(prefers-reduced-motion: reduce)')` matches, and add
   `reducedMotion: 'reduce'` to `playwright.config.ts` `use:`. Overlays become
   instant and stable; also a genuine a11y win. Requires re-verifying no visual
   regression in headed mode.
   Files: `components/ui/paperTheme.ts` (or provider call site),
   `playwright.config.ts`, `e2e/helpers/flows.ts` (revert to plain clicks).

Acceptance: O3/N1/N2 un-skipped, green locally ×3 and in CI (Phase F may land
first to prove CI).

## Phase B — Income suite (I1–I4)

Un-skip `e2e/specs/income.spec.ts`, implement with shared dialog helper:

- I1: `income-empty-action` → fill `income-amount-input` + `income-label-input`
  → `add-income-dialog-action-save` → `income-row-0` + totals update.
- I2: second income via `income-fab`; totals card equals sum.
- I3: totals card sticky after scroll.
- I4: Total / Remaining / Daily present in `income-totals-card`.

New helper: `e2e/helpers/dialogs.ts` — `fillAndSave(page, {amount, label,
saveTestId})`, reusing the Phase A overlay pattern (dialogs animate too).

## Phase C — Obligations suite (B1–B4)

Un-skip `e2e/specs/obligations.spec.ts`:

- B1: fixed obligation via `obligations-fab`.
- B2: percentage obligation — toggle `obligation-percentage-switch` on, totals
  reflect % of total budget.
- B3: rows contain no ISO date strings.
- B4: daily + remaining recalculated in totals card.

## Phase D — Expenses suite (E1–E4)

Un-skip `e2e/specs/expenses.spec.ts`:

- E1: add expense → `expenses-row-0`, total + remains updated.
- E2: two same-day expenses → single grouped day card.
- E3: expense > daily budget → day card warning styling (assert stable
  class/testID hook — add `testID` to app code first if needed, never
  assert on raw CSS from specs without a hook).
- E4: `expenses-totals-card` sticky at bottom on scroll.

## Phase E — Calculations suite (C1–C2)

Un-skip `e2e/specs/calculations.spec.ts`:

- C1: seed income → obligation → expense; remains agree across income,
  obligations, and expenses totals cards.
- C2: `page.reload()` → rows + totals intact (AsyncStorage persistence).

## Phase F — CI workflow

New `.github/workflows/e2e.yml`:

```yaml
npm ci → npx playwright install chromium → npm run e2e:build → npm run e2e
```

Upload `playwright-report/` + `test-results/` on failure. May land before
Phase A to prove O3/N1/N2 in CI.

## Later (out of scope for A–F)

- Firefox/WebKit projects in `playwright.config.ts`.
- Trace retention / shard slow suites.
- Visual regression (deferred non-goal of the strategy).

## Execution order

F (cheap, parallelizable) → A (unblocks everything) → B → C → D → E.
Update the §7 matrix in `E2E_PLAYWRIGHT_DESIGN.md` as each suite lands.
