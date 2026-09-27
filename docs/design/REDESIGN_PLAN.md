---
title: Redesign (mockups)
nav_order: 13
parent: Design docs
---

# Redesign Plan — from `docs/redesign/` mockups

Source: 4 mockup images (`income.jpg`, `income_add.jpg`, `expenses.jpg`,
`obligations.jpg`) showing mobile + web variants of the three tab screens,
the expense modal, the obligation modal, and a full-screen add-income form.
Decisions §4 resolved 2026-09-27. STATUS: P0 + P1 + P2 done, P3–P6 pending.

## 1. What the mockups show

### Income (`income.jpg`: mobile + web)
- Top-left `Budgetery` wordmark (mobile) / screen title + sidebar (web).
- Green gradient hero card: `Total Income: 41600` + white rounded `+` button
  embedded top-right.
- Single white list card, one row per item: gray-circle glyph left,
  `Label - amount` + `dd/mm/yyyy` date below, pencil icon right.
- Green circular FAB bottom-right, floating above the totals.
- Totals strip (Total / Remaining / Daily / Remains, 4 columns) pinned above
  the bottom tab bar.
- Bottom tabs: Income (active, pastel pill + tinted label) / Obligations /
  Expenses.
- Web: left sidebar (`Budgetery`, Home, Income active, Obligations, Expenses,
  divider, Track, Settings); hero card + list center, totals card right.

### Add income (`income_add.jpg`)
- `Add Income` header with green back chevron (top-left).
- White card `Add new income`: Amount (`$` right icon), Label (tag icon),
  Date (calendar icon) + plain date value below, full-width green rounded
  `Add Income` CTA.
- Totals strip + 3-tab bar persist behind the form.

### Expenses (`expenses.jpg`: mobile + modal + web)
- Centered `Expenses` title; gray gradient hero (`Total Expenses: 30`).
- Day groups as light-gray rounded strips: `Sun 13 Sept – 15 (2)` (weekday,
  date, day total, count). Rows: glyph + `label – amount`. **No pencils.**
- Gray circular FAB. Web: gray `Add Expense` pill under the hero; totals
  block top-right (right-aligned values).
- `Add expense` modal: rounded inputs (Amount with comma-separated hint,
  Label, Date with calendar icon + value), helper line, `Back` (text) /
  `Save` (gray pill) footer.
- Mobile tab bar here shows **Home / Expenses / Track / Settings (4 items)** —
  inconsistent with the 3-tab bars elsewhere (see §4.3).

### Obligations (`obligations.jpg`: mobile + modal + web)
- Red gradient hero (`Total Obligations: 41762`) + white `+`.
- Rows: `label – 50% = resolved` (+ date), glyphs, pencil icons.
- `Add obligation` modal: Amount/Percentage toggle rows, Amount, Label, Date,
  Back / Save (green) footer.

## 2. Design language extracted

- Canvas: light lavender (`~#F5F3FA`); cards white, radius ~16–20, no
  photo headers — **flat, no parallax illustrations** (departs from current
  `ParallaxScrollView` headers).
- Gamma gradient per screen (aligns with existing `screenGamma.ts`):
  income green, obligations red, expenses gray. Mockups are **light-mode
  only** — dark-mode mapping is an open decision (§4.6).
- Hero summary card per tab with embedded `+`; circular FAB in screen gamma
  (green / dark-green / gray); totals strip (mobile) / totals card (web).
- Rows: 40px list, gray-circle leading glyph, two-line title/date,
  trailing pencil (income/obligations only).
- Modals: `outlined` rounded inputs with trailing icons, helper text,
  Back-text + Save-pill footer (obligations Save is green, expenses gray).

## 3. Delta vs current app (file refs)

| Mockup element | Current state | Work |
|---|---|---|
| Hero gradient card + embedded `+` | `AppCardTitle` totals card, no gradient, no embedded button (`app/tabs/*.tsx`) | New `SummaryHero` component (Paper `Card` + `LinearGradient` — needs `expo-linear-gradient`, the one new dep — or gamma-tinted `Surface` fallback, §4.7); `+` opens the same modal as FAB |
| Row glyphs + pencils | `AppListRow` text-only; rows already tap-to-edit | Keyword→glyph map (§4.2) rendered via `AppListRow left`; pencil affordance (tint, non-interactive — row `onPress` stays the handler) |
| Day-group gray strips | `ExpenseDayCard` accordion cards (white/pink) | Restyle header to gray strip; keep `-warned` testID + pale-red body |
| Totals strip / totals card | `StickyTotalsBar` (4 items, sticky) | Restyle only (strip on mobile, side card on web); values/logic unchanged |
| Modal inputs with trailing icons | `AppTextInput` exposes no `right` prop (`components/ui/AppTextInput.tsx:4-7`) | Add `right` passthrough (`$`, tag, calendar glyphs); Back/Save footer already exists via `AppDialog` actions |
| Full-screen add form (`income_add.jpg`) | Add flows live in modals | Decision §4.5: restyle modal vs new route |
| Web sidebar (Home/Track/Settings + tabs) | `PaperTabBar` bottom tabs on all sizes | New responsive shell (§4.4): sidebar ≥ breakpoint, tabs below; Home→`/`, Settings→`/config`, Track→TBD |
| Flat background, no header photos | `ParallaxScrollView` + `*-back.jpeg` per tab | Remove header images/illustrations on the 3 tabs (keep component for other screens or retire) |

What stays untouched: store, reducers, persistence, sync, auth gate,
grouping/overlap math, testIDs (additive only), E2E flows.

## 4. Decisions (resolved 2026-09-27)

1. **Single primary action** — only the FAB opens the modal. Hero `+`
   scrolls the list (mobile); on web the hero `+` / pill is the sole action
   (no FAB there). One-primary-action convention stands.
2. **Keyword glyph map** — label substring → glyph, neutral fallback; no
   store migration.
3. **3 tabs** — Income/Obligations/Expenses everywhere; Home/Track/Settings
   sidebar-only on web.
4. **Sidebar mapping as proposed** — Home→`/` (welcome/months),
   Settings→`/config`, Track→ start-new-month entry on welcome; breakpoint
   ≥1024px.
5. **Restyle modals** — no new routes; full-width content on narrow screens.
6. **Gamma-mapped dark** — dark gradient stops in `screenGamma.ts`, headed
   verification per screen.
7. **`expo-linear-gradient`** — first-party, web-compatible; `Surface`
   fallback if export breaks.

## 5. Milestones & verification (screen-phased)

Each screen ships end-to-end (hero + rows + totals + its modal) before the
next begins; shared foundations land in P0. Every phase exits:
`npx tsc --noEmit`, `npx jest --silent --runInBand`,
`npx expo export --platform web --output-dir dist`, E2E green
(testIDs additive only — existing suites must not break).

- **P0 foundations (0.5–1d):** canvas + gamma gradient tokens in
  `screenGamma.ts` (+ dark stops, §4.6); gradient approach spike (§4.7);
  `AppTextInput right` prop; glyph keyword map + unit tests (§4.2).
  No screen changes.
- **P1 Income (1–2d):** `SummaryHero` (green gradient + embedded `+`);
  glyph + pencil rows; totals strip; remove income header photo; modal
  restyle (trailing icons, Back/Save). E2E: income suite green + `*-hero-add`.
- **P2 Obligations (1d):** red hero; `% = resolved` rows + pencils; totals;
  remove header photo; obligation modal (Amount/Percentage toggles +
  footer). E2E: obligations suite green.
- **P3 Expenses + add-expense modal (1–2d):** gray hero + `Add Expense`
  pill (web); day-group gray strips (keep `-warned` + pale-red body);
  rows without pencils; totals; remove header photo; expense modal
  (comma hint, date + helper, Back/Save). E2E: expenses suite + E5 green.
- **P4 Add-income form (0.5d):** §4.5 outcome applied (restyled modal or
  full-width variant); green CTA; back chevron.
- **P5 responsive shell (1–2d):** sidebar ≥1024px (Home/Track/Settings
  mapping, §4.4), bottom tabs below; totals side card on web; web E2E
  viewport asserts. Mobile snapshots unaffected.
- **P6 polish:** dark-mode headed pass; screenshot-driven review per the
  S-phase method (`PAPER_MIGRATION_DESIGN.md` §5): scripted shots per
  screen light+dark, gap log, fix, re-shoot; temp specs deleted afterwards.

## 6. Risks

1. Sidebar + expo-router static export: deep links must keep working
   (Vercel clean URLs); responsive shell is layout-only, no route changes.
2. Glyph keyword map can misfire on free-text labels — fallback glyph must
   read neutral; user-facing mapping table documented in the component.
3. Gradient lib (if adopted) must not break `expo export` or dark mode;
   fallback ready (§4.7).
4. Scope discipline: no store/logic changes in R1–R4; icon-field migration
   only if §4.2 decides so.
