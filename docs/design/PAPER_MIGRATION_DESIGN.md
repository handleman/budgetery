# React Native Paper Migration — UI Element Audit & Design Doc

Date: 2026-09-10. Installed version: `react-native-paper@^5.15.3` (MD3 themes
via `components/ui/paperTheme.ts`). Context7 docs consulted are 6.x — every
API below must be re-verified against the installed v5 before coding.

Prompt: *"I don't see BottomNavigation but we have a bottom bar"* — correct.
The bottom bar is expo-router's default `Tabs` tab bar, not Paper. This doc
audits every non-Paper element and decides migrate vs keep.

## 0. Verdict

| # | Element (current) | Paper target | Verdict |
|---|---|---|---|
| P1 | Bottom bar: expo-router `Tabs` default tab bar (`app/tabs/_layout.tsx`) + Ionicons `TabBarIcon` | `BottomNavigation.Bar` as `Tabs tabBar` | **MIGRATE** (biggest gap, user-visible MD3 upgrade) |
| P2 | `ExpenseDayCard` custom expandable (`components/expenses/`) | `List.Accordion` (controlled) | **MIGRATE** (small, testID-safe) |
| P3 | `Hr` custom divider (income + expenses screens) while `AppDivider` exists | `AppDivider` (Paper `Divider`) | **MIGRATE** (trivial consolidation) |
| P4 | Bare `Checkbox` import in `TutorialProgress` | New `AppCheckbox` adapter | **MIGRATE** (adapter-convention compliance) |
| P5 | `ThemedText` custom vs Paper `Text` (mixed: `AppEmptyState` uses Paper `Text`) | Rebase `ThemedText` on Paper `Text` | **MIGRATE** (small, keeps API) |
| P6 | Month-list `Pressable`+`ThemedView` rows (welcome) | `List.Item` / `List.Section` | **MIGRATE** (small) |
| P7 | `StickyTotalsBar` custom `View` | Keep custom, rebase on Paper `Surface` | **KEEP + rebase** (no Paper sticky-footer exists) |
| P8 | Stack headers (`app/_layout.tsx`, welcome title) | `Appbar.Header` via `header` option | **OPTIONAL** (only if headers add actions/titles) |
| P9 | `%` / `↻` / `⚠` text markers on rows | `Chip` / `Badge` | **OPPORTUNITY** (needs new testIDs) |
| P10 | Boot splash gap (`RootLayout` returns `null` while fonts load) | `ActivityIndicator` | **OPPORTUNITY** (tiny) |
| P11 | Date entry (`YYYY-MM-DD` text inputs) | Paper has **no** DatePicker; `TextInput` right icon only | **KEEP** (no target exists) |
| P12 | Day-by-day budget breakdown (usecase, no UI yet) | `DataTable` | **OPPORTUNITY / new feature**, not migration |
| P13 | `ParallaxScrollView`, `HelloWave` | No Paper equivalent | **KEEP** |
| — | `Searchbar`, `SegmentedButtons`, `Snackbar`, `Banner`, `Avatar` | — | **OUT OF SCOPE** (no usecase demands them; see §5) |

Already on Paper (no action): `AppButton`, `AppCard`, `AppDialog` (+Portal),
`AppFAB`, `AppListRow`, `AppMenuSelect`, `AppSwitch`, `AppTextInput`,
`AppEmptyState` (via Paper `Button`+`Text`).

## 1. Current-state inventory (evidence)

- `app/tabs/_layout.tsx` — `Tabs` from expo-router, default tab bar, icons via
  `components/navigation/TabBarIcon.tsx` (Ionicons, `@expo/vector-icons`).
  `tabBarButtonTestID: tab-income/tab-obligations/tab-expenses` — E2E depends on these.
- `components/ui/` adapters wrap Paper: Button, Card, Dialog, Divider, FAB,
  List (`AppListRow`), Menu (`AppMenuSelect`), Switch, TextInput. Convention
  (paperTheme.ts): screens import via adapters, never Paper directly.
- Non-Paper exceptions: `Hr` (used in `app/tabs/index.tsx`, `expenses.tsx`
  alongside `AppDivider`), bare `Checkbox` in `TutorialProgress`,
  custom `ExpenseDayCard` (expand/collapse hand-rolled with `ThemedText onPress`),
  custom `StickyTotalsBar` (plain `View`), welcome month rows (`Pressable`),
  `ThemedText` (custom) vs Paper `Text` in `AppEmptyState`.
- `node_modules` contains **no** `react-native-vector-icons`. Paper icon props
  (`FAB icon="plus"`, menu `chevron-down`) therefore need a render check on
  web + native before any migration that depends on Paper-rendered glyphs
  (see risk R1).

## 2. Migration designs

### P1 — `BottomNavigation.Bar` as the bottom bar (headliner)

Paper's documented pattern is a `tabBar` render prop on the tab navigator
(`BottomNavigation.Bar` + `navigationState`, `onTabPress` dispatch,
`renderIcon`, `getLabelText`, `getTestID`). Expo-router `Tabs` forwards
`tabBar` to the underlying `@react-navigation/bottom-tabs` navigator, so the
migration is a `tabBar={...}` prop in `app/tabs/_layout.tsx` — routing,
deep links, and typed routes stay on expo-router; only the bar chrome changes.

- Icons: keep existing Ionicons via `renderIcon` (avoids R1 entirely).
- Labels: keep `title: Income/Obligations/Expenses` via `getLabelText`.
- E2E: preserve `tab-income/tab-obligations/tab-expenses` via `getTestID`
  (verify the prop exists in installed v5; if it is missing, P1 is blocked
  until a test hook is added to app code first, per repo convention —
  positional selectors are forbidden).
- Shifting vs static: 3 tabs → static (`shifting={false}`), MD3 active indicator.
- Acceptance: O3/N1/N2 + I/B/E suites green unmodified; headed visual check
  light/dark; `tabBarActiveTintColor` behavior preserved via `activeColor`.

### P2 — `ExpenseDayCard` → `List.Accordion`

`List.Accordion` supports controlled `expanded`/`onPress`, `testID`, custom
`left`/`right`. Map: title = `date — total (count)`, description = overlap
note, children = `AppListRow`s. Warned styling: `style` + `contentStyle` accept
the pale-red background. Keeps `expenses-day-{key}[-warned]` testIDs and the
default-expanded behavior. Deletes ~30 lines of hand-rolled toggle code.

### P3 — `Hr` → `AppDivider`

`Hr` and `AppDivider` do the same job; screens use both. Delete `Hr`
(or re-export `AppDivider` from it for one release), replace two usages.

### P4 — `AppCheckbox` adapter

`TutorialProgress` imports Paper `Checkbox` directly, violating the
adapter convention. Add `components/ui/AppCheckbox.tsx`, export from
`components/ui/index.ts`, switch the one usage. `tutorial-check-*` IDs unchanged.

### P5 — `ThemedText` on Paper `Text`

`ThemedTextProps` already extends RN `TextProps`; extend Paper `Text` props
instead and render Paper `Text` underneath. Keeps `type="title/..."` API and
`onPress` usage (Accordion headers, day cards). Unifies font scaling with
`labelMaxFontSizeMultiplier`-style MD3 behavior. Snapshot churn expected —
update snapshots, verify no visual regression headed.

### P6 — Month rows → `List.Item`

Welcome `month-row-{i}` `Pressable`s become `List.Item` with `onPress`,
`title`, `description` (year), `right` (chevron when active). Same testIDs.

### P7 — `StickyTotalsBar` rebased on `Surface`

Paper has no sticky footer; the custom bar stays. Rebase container on Paper
`Surface` (elevation + theme-aware background instead of hardcoded
`#FFFFFF/#151718`), keep layout, testIDs, and outside-the-scroll placement.

## 3. Risks (read before coding)

- **R1 — Icon fonts.** No `react-native-vector-icons` in `node_modules`; verify
  how current `icon="plus"/"chevron-down"` glyphs render on web export + native
  before relying on Paper-rendered icons. P1 sidesteps this via `renderIcon`.
- **R2 — v5 vs 6.x drift.** Research sources are 6.x; installed is v5.15.3.
  Re-verify `BottomNavigation.Bar` props (`getTestID`, `renderIcon`,
  `getLabelText`, `onTabPress` signature) and `List.Accordion` props in v5.
- **R3 — E2E overlay lesson.** Paper overlays (Menu) auto-dismiss headless;
  `BottomNavigation.Bar` is not an overlay (safe), but any new Modal/Dialog
  usage must follow the `dialogs.ts` pattern. Re-run full `npm run e2e` per phase.
- **R4 — Snapshot churn.** P2/P5 touch rendered output; commit snapshot updates
  separately from behavior changes.
- **R5 — expo-router coupling.** P1 must not move routing off expo-router
  (typed routes, deep links). Only the `tabBar` render prop changes.

## 4. Suggested build order

- **M1 (0.5d):** P3 + P4 + P6 (trivial, no visual risk). Gate: tsc + jest.
- **M2 (0.5–1d):** P2 Accordion + P7 Surface rebase. Gate: + e2e expenses suite.
- **M3 (1d):** P1 BottomNavigation (verify R1/R2 first, keep testIDs). Gate: full e2e ×3.
- **M4 (0.5d):** P5 ThemedText rebase + snapshot refresh, headed check.
- **M5 (optional):** P8–P10 opportunities; P12 DataTable breakdown is a feature,
  needs its own usecase spec before design.

## 5. Styling trim pass (S-phase) — visual consistency

Status: current design is visually broken (ad-hoc colors, over-round dialog
corners, inconsistent component rhythm). Goal: converge every screen on
Paper MD3 defaults from `paperTheme.ts`, with exactly one deliberate
exception — per-screen color gamma:

- Income = green (from `income-back.jpeg` header illustration),
- Obligations = red (from `obligations-back.jpeg`),
- Expenses = gray (from `expenses-back.jpeg`).

Gamma is derived from the header illustration of each screen and applies to
header background + primary accents on that screen only; everything else
(spacing, shapes, typography, elevation) follows the default Paper theme.

Scope (S1–S4):

- **S1 Dialog shape.** `AppDialog` corners read too round vs MD3. Reduce to the
  theme `roundness` (12) via `style={{ borderRadius }}` on `Dialog`, keeping
  `testID` + action auto-ID behavior. Verify light/dark + headed.
- **S2 Screen gamma.** Replace hardcoded header colors with gamma tokens in
  one place (extend `paperTheme.ts` or a `screenGamma.ts`: per-screen
  `{ header, accent, warned }`). Warned day cards use theme
  `errorContainer`, tinted toward the screen gamma — never raw red on gray.
- **S3 Spacing/typography rhythm.** Single content padding (32), card margins,
  FAB placement, totals-bar height/typography (`labelSmall` + `titleMedium`)
  identical on all three tabs. Remove one-off `StyleSheet` values that fight
  the theme.
- **S4 Dark-mode pass.** Every touched screen reviewed headed in dark mode;
  gamma colors must keep contrast on dark surfaces.

Method: screenshot-driven. For each screen (welcome, income ± data, income
modal, obligations ± data, expenses grouped + warned, each sticky bar) capture
the web export headless via Playwright, read the screenshots, log gaps against
S1–S4, fix, re-shoot. E2E `data-testid` hooks already exist for every target,
so shots are scripted (`e2e/specs/`-adjacent temp spec, deleted afterwards),
never hand-clicked.

Gate per screen: shot before/after in `visual/` (gitignored scratch),
`tsc + jest + e2e` green, headed eyeball check light + dark.

### Observed gaps (screenshot evidence, 2026-09-10)

Shots: `test-results/visual/` (v1–v10 first pass, s1–s7 second pass; scripted
via temp specs, since deleted; recipe in §5 method). Headless Chromium
1280×720, light mode unless noted.

- **V-A Dialog corners pill-like (S1, critical).** v4/v7: `AppDialog` renders
  ~64px+ corner radius — reads as a pill, not MD3 (28dp). Fix: explicit
  `borderRadius` (≈16) on `Dialog` style.
- **V-B Dialog surface patchwork (S1, critical).** v7: `ThemedView` blocks
  render as white rectangles on the lavender dialog surface (explanatory text,
  switch rows); v4 inputs show a double-frame effect. Fix: dialog content
  containers transparent / Paper `surface`, inputs single outline.
- **V-C CTA color fights screen gamma (S2, critical).** v1/v3/v6: "Get started!"
  is full-width teal while the income header is green and obligations red.
  Primary actions must use the screen gamma (green/red/gray); teal stays only
  where no gamma applies (welcome).
- **V-D FAB is a full-width lavender bar (S3).** v5/v8/v9: in-flow, edge to
  edge, no elevation — not an MD3 FAB. Fix: floating extended FAB
  (`secondaryContainer`, proper margins, above the totals bar) or a tonal
  button; one pattern on all tabs.
- **V-E `Hr` black full-bleed rule (S3).** v5/v9: thick black line vs MD3
  hairline inset divider. Confirms P3 (`Hr` → `AppDivider`).
- **V-F Raw ISO timestamps on income rows (S3).** v5:
  `2026-09-10T09:00:00.000Z` with time part. Humanize (`toLocaleDateString`);
  obligations rows (v8) are already clean.
- **V-G Totals bar needs Surface treatment (S3).** Structure is right
  (sticky, correct values, v10 proves pinning), but plain white + tiny labels.
  Rebase on `Surface`, MD3 text variants, consistent height with the tab bar.
- **V-H Default tab bar, no MD3 indicator (P1).** Thin gray bar in every shot.
  Confirms the BottomNavigation migration.
- **V-I Warned card works (keep).** v9 pale-pink grouped card with ⚠ reads
  correctly; keep hue, retint toward expenses-gray gamma per S2 rule.
- **V-J Header image pops in late (minor).** v6 shows solid red before the
  illustration loads (v8). Acceptable (`headerBackgroundColor` fallback);
  shimmer is a polish extra, not S-scope.
- **Not broken:** welcome checklist card (v2), month/label inputs, empty-state
  copy, tab switching, totals math (31000/1033.33/7500-pattern values correct
  in every shot).

### Round-2 verification (after S1–S3 implementation, same day)

- V-A fixed (s1: dialog corners modest, theme roundness).
- V-B fixed (s1: single-frame inputs, no white patchwork).
- V-C fixed (s2/s3: green/red gamma CTAs; s4 slate expenses FAB).
- V-E/V-F fixed (s2: hairline dividers, `9/10/2026` dates).
- V-H fixed (w1/w2: Paper `BottomNavigation.Bar` with MD3 active pills).
- **V-K (new): Accordion paints its own surface strip inside warned cards**
  (s4: white title strip on pink card). Root cause: Paper hardcodes
  `theme.colors.background` on an inner wrapper — `style` cannot reach it.
  Fixed in `AppAccordion` via per-instance theme override (background
  transparent); verified seamless (s8).
- **V-L (new): dark-mode headless shots are test artifacts, not app bugs.**
  Mid-session `emulateMedia(dark)` produced a half-dark render (s5/s6), but
  emulate-then-reload renders fully light (s7) — RN web `useColorScheme`
  resolves at load. Real S4 dark verification needs OS-level dark
  (headed run or device); tracked as headed-only follow-up.

## 6. Explicit non-goals

`Searchbar` (no search usecase), `SegmentedButtons` (tab switching already
covered), `Snackbar`/`Banner` (no notification usecase — validation is inline),
`Avatar` (no user profile), web-only pickers. Revisit when a usecase demands them.

## 7. Open decisions (need user input before M3)

1. P1 shifting vs static bar — proposed static (3 tabs, MD3 indicator).
2. P8 headers — migrate welcome/stack headers to `Appbar.Header`, or leave
   navigation chrome minimal? Proposed: leave unless actions are needed.
3. P9 Chip/Badge markers — worth new testIDs + E2E asserts, or keep text markers?
