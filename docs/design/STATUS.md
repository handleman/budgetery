---
title: Implementation status
nav_order: 0
parent: Design docs
---

# Implementation Status — where the app stands

Date: 2026-09-26. This is the **current truth** for what is built vs planned.
Dated design docs below it are snapshots — when they disagree with this page,
this page wins.

Legend: ✅ done · 🟡 partial · ⬜ not started.

## 1. Design-doc scoreboard

| Design doc | Status | Evidence / note |
|---|---|---|
| Use cases (`usecases.md`) | 🟡 living doc | Core budgeting usecases fulfilled (see §2); hosting + login sections added 2026-09-26, unimplemented |
| E2E: Playwright design | ✅ done | 6 suites in `e2e/specs/` (+ helpers, fixtures); served from `dist/` via `playwright.config.ts` |
| E2E: implementation plan | ✅ done | Banner in doc: all phases complete, 20/20 green |
| UX library decision | ✅ done | Paper chosen and used app-wide (`PaperProvider` in `app/_layout.tsx`) |
| Paper migration | ✅ done | `PaperTabBar`, `ExpenseDayCard` on `AppAccordion`, `StickyTotalsBar` on `Surface`, `ThemedText` on Paper `Text`, `AppChip` markers (P9), boot `ActivityIndicator` (P10), `DayBreakdownTable` DataTable (P12) done; P8 headers stay minimal by decision |
| Persistence layer | ✅ done | `PersistenceService` wired in `store/context.tsx` (load on start, save on every mutation); AsyncStorage / IndexedDB / session / mock adapters; migrations at v2 |
| Usecase fulfillment (M1–M7) | 🟡 mostly done | M1 correctness, M2 sticky footers, M4 grouping/date/edit/CSV, M5 overlap, M6 multi-month isolation done; leftovers in §3 |
| Drive sync (M1–M5) | 🟡 M1+M2 done | Config shell + Google auth (`useGoogleAuth`, token vault, `config-connect/disconnect`) done and verified on web; **M3 folder+push/pull and M4 auto-sync not started** (`driveClient.ts` / `syncService.ts` absent, folder row is a placeholder) |
| Cloud setup | 🟡 partial | Web OAuth client exists (`googleConfig.ts`); pending: production origin registration, iOS/Android clients (need native builds first) |
| Native builds | ⬜ plan only | No `eas.json`, no bundle IDs, no `expo-dev-client`; web-first until then |
| GitHub Pages website | 🟡 skeleton done | `_config.yml` + section indexes + front matter done; live deployment under Settings → Pages unverified |
| Web hosting + login | 🟡 code done, deploy pending | `app/login.tsx` + `AuthGate` + lock buttons + `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` + registered `config` route done, 24/24 E2E green; pending owner actions: Vercel project, production origin in Google console; encryption (M4) not started |

## 2. Feature matrix (usecases → code)

| Usecase area | Status | Evidence |
|---|---|---|
| Bottom navbar (income/obligations/expenses) | ✅ | `app/tabs/_layout.tsx` (`tab-income/tab-obligations/tab-expenses`), `PaperTabBar` |
| Welcome: tutorial gate, month+label validation, month list, config entry | ✅ | `app/index.tsx` (`welcome-get-started`, `welcome-apply` disabled until valid, `month-list`, `month-row-N`, `welcome-config`) |
| Income: add/edit/delete, dates, totals (total/remaining/daily), sticky footer | ✅ | `app/tabs/index.tsx` (`income-totals-bar`, `income-fab`), `AddIncomeModal` (`income-date-input`) |
| Obligations: fixed + % amounts, no timestamps, sticky footer | ✅ | `app/tabs/obligations.tsx` (`obligations-totals-bar`, `obligation-percentage-switch`) |
| Expenses: day-grouped expandable cards, date/edit, comma multi-entry, overlap warnings, sticky totals | ✅ | `app/tabs/expenses.tsx` (`expenses-totals-bar`), `ExpenseDayCard` (`expenses-day-{key}[-warned]`), `groupExpensesByDay`, `computeOverlapWarnings`, `expense-date-input` |
| Expenses: day-by-day breakdown table | ✅ | `DayBreakdownTable` (`expenses-day-table`, `expenses-day-table-row-{dayKey}`) |
| Login gate + lock | ✅ (code) | `app/login.tsx` (`login-title/connect/error`), `AuthGate` (`auth-gate-loader`), `welcome-lock`, `config-disconnect` → `/login`; E2E via `budgetery.e2e.auth` seam (`login.spec.ts` L1–L3) |
| Hosted web version (public URL) | 🟡 code-ready | Export + env-var + routes ready; owner still to create Vercel project + register production origin |
| Multi-month: periods list, select, start-new-month (resets tab tutorials) | ✅ | `periods[]` + `currentPeriodId` in `store/types.ts`, `START_NEW_MONTH` / `SELECT_PERIOD`, migration v2 |
| Tutorial routing (first run → income, else expenses) | ✅ | Redirects in `app/tabs/index.tsx`, `app/index.tsx` |
| State persistence + accurate cross-screen calculations | ✅ | `PersistenceService`, `migrations.ts`, `reducer.test.ts` |
| Config screen + Google connect/disconnect | ✅ | `app/config.tsx` (`config-status/connect/disconnect`); folder/sync rows pending M3 |
| Login gate guarding financial data | ✅ (code, soft lock) | Gate + lock done; local data still plaintext until encryption (M4) |

## 3. Known leftovers (accepted scope for future milestones)

1. `TutorialProgress` checklist component (`tutorial-progress`, `tutorial-check-*`) — planned, never built.
2. Drive M3/M4: folder selection, push/pull, conflict backup, auto-sync.
3. Recurring obligations (`obligation-recurring-switch`) + income projections (`store/projections.ts`).
4. Hosting deploy (Vercel project + production origin — owner clicks), encryption at rest (M4).
5. Native builds (bundle IDs, EAS, dev client) + iOS/Android OAuth clients.

## 4. Verify trio (run before any commit)

```bash
npx tsc --noEmit
npx jest --silent --runInBand
npx expo export --platform web --output-dir dist
```
