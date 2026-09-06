# UX Library Decision & Implementation Design

## 1. Problem Statement

Budgetery styling is hand-rolled and poor:

- Raw `StyleSheet.create` per screen (`app/tabs/index.tsx`, `expenses.tsx`, `obligations.tsx`), no shared tokens beyond `constants/Colors.ts` (text/background/tint only).
- Primitives are thin wrappers: `ThemedText`, `ThemedView` + stock RN `Button`, `TextInput` with ad-hoc borders (`#ccc`, radius 4).
- Modals use `react-native-modal` + manual layout (`components/modal/Add*Modal.tsx`); picker uses `react-native-picker-select`. No cards, lists, FABs, snackbars, segmented controls — budget lists are unstyled `map()` rows with a `// todo: style the list` comment.
- Dark mode works (`useThemeColor`, `userInterfaceStyle: automatic`) but every new screen re-implements spacing/typography.
- Result: inconsistent, "unstyled MVP" look, slow to extend (every form = new StyleSheet).

Goal: adopt a popular, maintained UX library that gives instant polish with minimal lock-in, reusable across **iOS + Android + Web (Expo SDK 51, RN 0.74.3, expo-router static export)**, with an allowed compromise of a different library on web-only surfaces (landing/SEO pages).

## 2. Constraints & Requirements

Current stack (from `package.json`, `app.json`):

- Expo ~51.0.18, React 18.2, RN 0.74.3, `react-native-web` 0.19.10, expo-router 3.5.17 file routing, Metro static web export.
- Already installed: `reanimated ~3.10.1`, `gesture-handler`, `safe-area-context`, `async-storage`, vector-icons.

Evaluation criteria (weighted):

1. **Cross-platform reuse (30%)** — same code renders on iOS/Android/Web without forks.
2. **Expo SDK 51 compatibility, no New Arch requirement (20%)** — must work on RN 0.74 today; no forced SDK 54 upgrade.
3. **Component coverage for our needs (20%)** — Button, TextInput, Card/List, Dialog/Modal, Menu/Select, FAB, Snackbar, Tabs/Segmented.
4. **Setup cost + learning curve for solo/small team (15%)** — hours, not days.
5. **Theming/a11y/dark-mode (10%)** — tokens, MD3 or equivalent, screen-reader labels, 48dp targets.
6. **Health: downloads, releases, docs, Expo guidance (5%)** — avoid deprecated paths.

Out of scope: full rebrand, custom illustration system, marketing site.

## 3. Candidates Investigated

Sources: Context7 docs for NativeWind v5, Tamagui, React Native Paper; web research Dec 2025–Jun 2026 roundups (LogRocket, reactnative.live, React Native Relay, Applighter).

### 3.1 React Native Paper (v5, Material Design 3) — COMPONENT LIBRARY

- What: Callstack's mature MD3 kit. `PaperProvider`, `Button`, `Card`, `TextInput`, `Dialog`, `Modal`, `Menu`, `FAB`, `Snackbar`, `SegmentedButtons`, `List`. MD3 light/dark themes + `adaptNavigationTheme` for React Navigation.
- Platforms: iOS/Android/Web via `react-native-web`. Expo guide is `npx expo install react-dom react-native-web @expo/metro-runtime` + `PaperProvider` wrap — already satisfied in this repo.
- Health: ~337k weekly downloads, stable, extensive docs + live examples. Maintenance pace slower than hype libraries but production-proven.
- Pros: 5-minute setup; instant polish; built-in a11y; predictable; Babel plugin for tree-shaking.
- Cons: "Google look" — fighting defaults for bespoke brand is work; bundle weight if fully imported.

### 3.2 NativeWind (v4.1 stable for us / v5 latest) — UTILITY STYLING ENGINE, not components

- What: Tailwind classes (`flex-1 bg-white px-4`) compiled to `StyleSheet.create` at build time; CSS variables for theming; `dark:` / `md:` variants.
- Platforms: true universal (native styles + web CSS). v4.1 = stable choice for Expo SDK 51 / RN 0.74–0.80. **v5 requires RN 0.81+ / Expo SDK 54+ (Tailwind v4.1+, Reanimated v4)** — incompatible without upgrading this repo.
- Health: ~400–517k weekly downloads, most adopted styling layer, Expo blog endorsed (Feb 2026).
- Pros: zero runtime cost, Tailwind DX transfers, kills per-screen StyleSheets, coexists with component kits.
- Cons: ships **no components** — still need Paper/Gluestack/NativeWindUI for Buttons/Cards/Dialogs; needs `tailwind.config`, `metro.config` (`withNativewind`), global CSS entry.

### 3.3 Tamagui — UNIVERSAL DESIGN SYSTEM + COMPILER + UI KIT

- What: tokens + `styled()` + compiler (atomic CSS on web, tree-flattening on native, 30–40% faster loads claimed) + prebuilt Button/Card/Sheet/Dialog.
- Platforms: best-in-class universal (iOS/Android/Web/Next.js), SSR-first.
- Health: ~75k weekly downloads, high innovation, smaller community; core free, Takeout/Pro component packs paid.
- Pros: one codebase peak performance; typed tokens/variants; true design-system scaling.
- Cons: steepest setup (30–60 min + `tamagui.config.ts`, compiler/babel config, entry-point shims like `@tamagui/native/setup-*`); overkill for 3-tab CRUD app; migration away is coupled (styles+tokens+components in one abstraction).

### 3.4 Gluestack UI (v5 stable, Jun 2026) — COPY-PASTE NATIVE COMPONENTS

- What: successor to NativeBase (deprecated/maintenance mode). v5 = unstyled accessible primitives styled with NativeWind v5 / Tailwind v4, Expo Router first, CLI copy-paste (no vendor lock-in).
- Platforms: **native-first pivot — Next.js/universal adapters officially dropped in v5** to focus on RN+Expo. Good for mobile, weaker for our "reuse on web" goal.
- Compatibility: v5 mandates NativeWind v5 → requires the same SDK 54 / RN 0.81+ upgrade. v3/v4 supported web but are superseded.
- Verdict: best re-evaluated **after** an SDK upgrade; not Phase 1.

### 3.5 NativeWindUI (Ronin) — NATIVE-FEELING TAILWIND TEMPLATES

- What: 30+ paid + free MIT components (Bottom Tabs, Action Sheets, pickers) that feel iOS-native / MD3 on Android, built on NativeWind.
- Pros: highest native fidelity, copy-paste ownership, good for onboarding/login/settings flows we lack.
- Cons: **paid license** ($99/qtr, $299 lifetime solo, $799/yr team); adds dependency chain (`flash-list`, `expo-symbols`, `cva`, `clsx`...); still needs NativeWind underneath.

### 3.6 Rejected

- **NativeBase**: deprecated, maintenance mode → migrate to Gluestack. Do not adopt.
- **React Native Elements (@rneui), UI Kitten, Shoutem, Dripsy**: declining downloads (~46k), dated patterns, poor web output, or legacy-only.
- **Unistyles 3**: excellent (C++ engine, zero re-render) but **requires New Architecture / RN 0.78+** — incompatible with RN 0.74.3 without upgrade.
- **Shopify Restyle**: type-safe primitives only, no widget coverage — too low-level for "fix poor styling fast".

### 3.7 Web-only compromise options (allowed divergence)

For static-export SEO/landing surfaces only (not the tab app): Tailwind CSS + **shadcn/ui** (Radix-based, semantic HTML, best SEO/a11y) or MUI/Chakra. Rule: business logic stays in `store/`; only view layer diverges via `Component.web.tsx` / `Platform.select`. Not needed in Phase 1 — Paper-on-RNW is sufficient for the app; revisit if we build a marketing site.

## 4. Decision Matrix

| Criteria (weight) | Paper | NativeWind 4.1 | Tamagui | Gluestack v5 | NativeWindUI |
|---|---|---|---|---|---|
| Cross-platform reuse (30%) | 8 — RNW, div-based | 9 — native styles + real CSS | 10 — atomic CSS + flattening | 6 — native-first, Next dropped | 8 — RN+Expo, web via NW |
| SDK51/RN0.74 compat (20%) | 10 — works today | 10 — v4.1 is the SDK51 build | 7 — works, picky build | 3 — needs SDK54/RN0.81 | 7 — needs NW + extra deps |
| Component coverage (20%) | 10 — full MD3 kit | 2 — none (engine only) | 9 — rich (some paid) | 9 — rich copy-paste | 9 — 30+ native-feel |
| Setup cost (15%) | 10 — ~5 min | 7 — metro+tailwind config | 4 — 30–60 min + compiler | 5 — CLI + NW5 + upgrade | 6 — manual install + license |
| Theming/a11y (10%) | 9 — MD3 + a11y baked | 7 — vars + dark: prefix | 9 — tokens, typed | 8 — tokens, a11y | 8 — theming, dark mode |
| Health (5%) | 9 — 337k/wk, Callstack | 10 — 500k/wk, Expo-endorsed | 7 — 75k/wk, niche-power | 7 — fresh v5, shifting | 6 — 3k devs, paid |
| **Weighted (~)** | **9.0** | **6.9** | **7.6** | **5.9** | **7.5** |

Scores are directional, not benchmarks; they encode "what ships polish fastest on our current SDK".

## 5. Recommendation

**Phase 1 (now, on SDK 51): React Native Paper + optional NativeWind v4.1 — hybrid.**

- **Primary: React Native Paper.** It is the only option that (a) works today with zero native upgrade, (b) replaces every ugly primitive in one move (Button → `Button mode="contained"`, lists → `Card`/`List.Item`, totals → `Card.Title`, inputs → `TextInput mode="outlined"`, modals → `Dialog`/`Modal`, add-actions → `FAB`/`Snackbar`), and (c) preserves web reuse via RNW. This directly fixes "styling looks really poor" in days.
- **Companion (same phase, low risk): NativeWind v4.1** as the layout/theming layer. Paper owns widgets; NativeWind kills bespoke StyleSheets (`className="flex-1 px-4 gap-2 dark:bg-slate-900"`), provides `dark:` and responsive variants, and pre-compiles to StyleSheet (no runtime cost). Pin to **v4.1**, not v5 — v5 forces an SDK 54 upgrade.
- **Explicitly deferred:** Tamagui (revisit if we need a formal multi-brand design system or web-SSR performance work); Gluestack v5 + NativeWind v5 + NativeWindUI (revisit after Expo SDK 54 upgrade); web-divergent shadcn/ui (only if we build SEO landing pages — then isolate to `*.web.tsx`).

Why not Tamagui-first? For a 3-tab budget tracker the compiler/token investment pays off only at design-system scale; Paper delivers 80% of perceived quality at ~10% of setup cost, and NativeWind keeps the door open to migrate later (utility classes transfer to any future kit).

Why not Gluestack-first? v5's native pivot + NW5 requirement contradicts both constraints (SDK 51 today, web reuse). Adopting it now means an SDK upgrade mid-redesign.

## 6. Implementation Plan

### Phase 1a — Paper foundation (1–2 days, no SDK upgrade)

1. `npx expo install react-native-paper react-native-safe-area-context` (safe-area already present — verify) + `react-native-vector-icons` interop via `@expo/vector-icons` (already present).
2. Optional bundle hygiene: enable Paper Babel plugin for tree-shaking.
3. Wrap root in `app/_layout.tsx`:
   ```tsx
   import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
   import { useColorScheme } from '@/hooks/useColorScheme';
   // theme = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme, extended with our brand seed
   ```
4. Bridge existing theme: map `constants/Colors.ts` (text/background/tint) into MD3 `theme.colors` (`primary`, `surface`, `onSurface`); keep `useThemeColor` working by reading from Paper theme so `ThemedText/View` don't break during migration.
5. Build thin adapter components (new `components/ui/`):
   - `AppButton`, `AppCard`, `AppTextInput`, `AppDialog`, `AppFAB`, `AppListRow`, `AppEmptyState` — each a Paper component with our defaults (rounded 12, content padding 16). Screens import only from `components/ui`, never Paper directly → future migration (Tamagui/Gluestack) touches one folder.
6. Migrate in slice order (each slice = run `npx tsc --noEmit`, `npx jest --silent --runInBand`, `npx expo export --platform web --output-dir dist`):
   - Modals (`AddIncomeModal`, `AddExpenseModal`, `AddObligationModal`): `react-native-modal` → Paper `Dialog` + `TextInput`; replace `picker-select` with Paper `Menu`/`SegmentedButtons` for %-vs-fixed.
   - Income/Expenses/Obligations lists: raw `map()` rows → `Card` + `List.Item` + `Divider`; totals → `Card.Title`/`Card.Content`; `Button title="Add more"` → `FAB` + contained `Button`.
   - Tab bar icons already vector-icons — tint via Paper theme.
7. Update snapshots: `commit new snapshots; never leave them untracked` (repo rule). Modal tests must keep the `react-native-modal` stub only until migrated, then drop it.

### Phase 1b — NativeWind v4.1 layout layer (2–3 days, still SDK 51)

1. `npm i nativewind@^4.1 tailwindcss@^3.4` + `tailwind.config.js` (content: `app/**`, `components/**`), `global.css` import, `metro.config.js` → `withNativewind`, remove any `nativewind/babel` preset (v4-style config; do **not** install v5).
2. Codemod screens: replace one-off `StyleSheet.create` layout (padding/gap/flex) with `className`; keep only truly dynamic styles inline.
3. Tokens: define brand colors/spacing/radius once in `tailwind.config` + CSS vars; `dark:` variant replaces manual `headerBackgroundColor={{light,dark}}` duplications.
4. Delete dead `styles.reactLogo`-style blocks as you go; keep `ParallaxScrollView` header images (they're asset-backed, fine).

### Phase 2 — Web divergence only if needed (on demand)

- If SEO/landing pages emerge: add `app/(marketing)/*.web.tsx` using Tailwind web + shadcn/ui (Radix) for semantic HTML; shared `store/` logic untouched. Never fork tab screens — Paper-on-RNW stays the single implementation there.
- Rule: any `.web.tsx` must have a native counterpart or an explicit "web-only route" comment + test asserting `Platform.OS` gating.

### Phase 3 — Re-evaluation gate (after Expo SDK 54 upgrade)

- Triggers: SDK 54 / RN 0.81+, or Tamagui/Gluestack offering a component we can't build, or web performance complaints (measure first).
- Then prototype Gluestack v5 (copy-paste, NW5) or Tamagui (compiler) on **one screen** behind the `components/ui` adapter seam; compare bundle size, cold start, and list scroll on low-end Android before committing.

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| MD3 "Google look" erodes brand | Override MD3 seed (`primary`, `surface`, roundness) + NativeWind tokens; adapters centralize the look |
| Paper bundle bloat | Babel tree-shaking plugin; import from `react-native-paper` top-level only via adapters (measurable via export size) |
| Snapshot churn across ~10 snap files | Migrate one screen per commit; run full jest suite per slice; commit new snaps immediately |
| `react-native-modal` timer leaks in tests (known repo issue) | Migrating to Paper `Dialog` removes the stub need; until then keep stub |
| Dark-mode regression | Keep `ThemedText/View` as compat shims reading Paper theme; verify both schemes in web export + console-log check |
| Temptation to install NativeWind v5 / Gluestack v5 now | Pin `nativewind@4.1`; add PR check: `npx expo export` must pass on SDK 51 before merge |

## 8. Acceptance Criteria

- [ ] All tab screens + 3 modals render via `components/ui` adapters (no stock RN `Button`, no raw `react-native-modal`).
- [ ] Dark/light parity visually verified on iOS simulator, Android emulator, and `expo export` web (`python3 -m http.server 8081` + nav/snapshot per AGENTS.md hybrid protocol).
- [ ] `npx tsc --noEmit`, `npx jest --silent --runInBand`, `npx expo export --platform web --output-dir dist` all pass; new snapshots committed.
- [ ] No New Architecture / SDK upgrade required; `package.json` diff is additive (Paper + NW4.1 only).
- [ ] Follow-up issue filed: "Re-evaluate Gluestack v5 / Tamagui after SDK 54".

## 9. References

- Context7: `/websites/nativewind_dev_v5` (Metro/Babel setup notes — v5 path documented, v4.1 pinned for SDK 51 instead), `/tamagui/tamagui` (expo-linear-gradient/compiler entry shims), `/callstack/react-native-paper` (Expo web install, MD3 theming, `adaptNavigationTheme`).
- Web: LogRocket "10 best RN UI libraries 2026" (SDK 54 compat table), reactnative.live "Best RN UI libraries 2026", React Native Relay "NativeWind vs Unistyles vs Tamagui 2026", Gluestack v5 stable release notes (Jun 2026 — Next.js support dropped), NativeWindUI pricing/licensing.
- Repo: `package.json` (SDK 51 / RN 0.74.3), `app.json` (static web export), `constants/Colors.ts`, `components/Themed*.tsx`, `app/tabs/*.tsx`, `components/modal/*.tsx`.

## 10. Addendum — SDK 57 Upgrade Completed (2026-09-06)

Branch `feat/session-upgrade-libs-260906-1700` upgraded Expo **51 → 57 stepwise** (52, 53, 54, 55, 56, 57), fix-forward. Final triad green: `tsc` clean, `jest` 17/17 (132 passed), `expo export` 6 static routes.

### 10.1 Final versions (selection)

`expo ^57.0.20`, `react-native 0.86.3`, `react/react-dom 19.2.3`, `expo-router ~57.0.19`, `reanimated 4.5.1` + `react-native-worklets 0.10.1`, `typescript ~6.0.3`, `jest-expo ~57.0.5`, `@types/jest ^30.0.0`, `babel-preset-expo ~57.0.0`.

### 10.2 Fixes required along the way (keep in mind for UI work)

- **SDK 52**: `Href` no longer generic (`ExternalLink.tsx`); AsyncStorage downgraded 3.x → 1.23.1 broke Jest → added `jest.setup.js` with the official AsyncStorage mock (keep it); asset/snapshot serialization churn → snapshots updated.
- **SDK 53 (React 19)**: `react-test-renderer` must match React major; **all renders AND unmounts must run inside `renderer.act()`** (concurrent root schedules work post-teardown otherwise) — applied to 11 test files; tab tests stub `react-native-modal` (RN 0.79 removed `BackHandler.removeEventListener`); reanimated mocks unified to the real-component shape.
- **SDK 54 (RN 0.81)**: install `react-native-worklets` (reanimated peer) and explicit `babel-preset-expo`; RN `Switch` internals changed → 1 snapshot updated.
- **SDK 55**: install `expo-modules-core` for jest (later removed again, see below); `ColorSchemeName` gained `'unspecified'` → `hooks/useColorScheme.ts` coerced to `'light' | 'dark'`, same coercion in `useThemeColor.ts`, `ParallaxScrollView.tsx`, `app/tabs/_layout.tsx`.
- **SDK 56/57**: top-level `splash` in `app.json` removed → migrated to `expo-splash-screen` plugin config; **`@react-navigation/native` direct import banned** → `app/_layout.tsx` now imports from `expo-router/react-navigation` and the direct dep was removed; `expo-modules-core` direct dep removed (transitive copy suffices; `useThemeColor.test.tsx` RN mock extended with `Platform`/`StyleSheet` shims); TS 6 needs explicit `"types": ["jest", "node"]` in `tsconfig.json` and `@types/jest@30` (doctor flags the latter as non-expected — intentional, documented deviation).

### 10.3 Revised recommendation (supersedes §5)

All blockers are gone: **RN 0.86 satisfies NativeWind v5 (RN 0.81+) and Gluestack v5, and New Architecture is standard, so Unistyles 3 is viable too.**

- **Primary: NativeWind v5 + Gluestack UI v5 (copy-paste).** Rationale: Tailwind v4 CSS-first styling kills the per-screen StyleSheets; Gluestack v5 is Expo Router-first, accessible, no vendor lock-in, and renders on our Expo web export (its "dropped Next.js" caveat only matters if we adopt Next.js — we use Metro static export, not Next). Prototype on ONE screen (Expenses: Card list + FAB + Dialog) behind the `components/ui` adapter seam before committing.
- **Fallback: React Native Paper.** If Gluestack's copy-paste workflow adds friction, Paper remains the 5-minute safe choice with full MD3 coverage on the same stack.
- **Not recommended now:** Tamagui (powerful but overkill for a 3-tab CRUD app; revisit for multi-brand scale), Unistyles 3 (great engine, but no widget coverage — pairs poorly with "fix poor styling fast"), web-divergent shadcn/ui (only if SEO landing pages materialize, isolated to `*.web.tsx`).
- **No SDK upgrade needed** for any of the above — that was the point of this session.
