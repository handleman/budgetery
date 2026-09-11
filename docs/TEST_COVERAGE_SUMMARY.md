# Budgetery - Test Coverage Summary

## Strategy (2026-09-11)

Two layers, no overlap:

- **Jest unit tests** (`npx jest --silent --runInBand`) — pure store logic only:
  fast, mocked, zero rendering. Anything involving UI lives in E2E.
- **Playwright E2E** (`npm run e2e:build && npm run e2e`) — all user flows
  (onboarding O1–O4, navigation N1–N2, income I1–I4, obligations B1–B4,
  expenses E1–E4, calculations C1–C2). See `docs/design/E2E_PLAYWRIGHT_DESIGN.md`.

Deliberately removed (were overlapping E2E or snapshot-only):
`app/tabs/__tests__/`, `components/modal/*.test.tsx`,
`components/{HelloWave,ThemedView}.test.tsx`, `components/__tests__/`,
`components/ui/AppMenuSelect.test.tsx`, `store/context.test.tsx`,
`store/sample.test.ts`, `hooks/useThemeColor.test.tsx`, `test-utils/`.
No snapshot tests remain (`Snapshots: 0`).

## Jest suites (7 files, `store/` only)

1. `store/reducer.test.ts` — tutorial flags, budget calculators, add/update/remove,
   multi-month isolation, recurring carry-over
2. `store/expenses.test.ts` — day grouping, CSV parsing, date parsing, overlap warnings
3. `store/projections.test.ts` — salary projections from prior-period date patterns
4. `store/types.test.ts` — type-guard validators
5. `store/enums.test.ts` — enum validation
6. `store/persistence/service.test.ts` — save/load round-trip, retry, validation
7. `store/persistence/indexed-db.adapter.test.ts` — IndexedDB save/load (web adapter)

## Run

```bash
npx tsc --noEmit                                  # typecheck
npx jest --silent --runInBand                     # unit tests (NOT npm test: --watchAll hangs non-interactively)
npx expo export --platform web --output-dir dist  # production build
npm run e2e:build && npm run e2e                  # end-to-end (Chromium, dist/)
```
