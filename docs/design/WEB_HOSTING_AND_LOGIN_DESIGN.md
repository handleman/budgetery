---
title: Web hosting + Drive auth
nav_order: 12
parent: Design docs
---

# Web Hosting + Drive Auth — Design Plan

> **Login gate removed 2026-09-28:** no backend exists and all data stays on
> device, so an app lock is theater — `app/login.tsx`, `AuthGate`, lock
> buttons, and the auth switcher were deleted. Google OAuth remains solely
> as the Drive-sync connector in the config screen. §§5, 6 (M2), 7 (2, 3)
> are record only.

## 1. Goals

1. **Host the Expo web export online** on a free static host with minimal ops overhead.
2. ~~**Add a login screen** guarding financial data~~ — dropped (see banner).

Plan only — no implementation.

## 2. Current state (what already exists)

### 2.1 Web export

- `app.json` → `web.bundler: metro`, `web.output: static`. `npx expo export --platform web --output-dir dist` already works (verify trio in `AGENTS.md`); `dist/` is gitignored.
- File-based routing via `expo-router` (`app/_layout.tsx` Stack: `index`, `tabs`, `config`, `+not-found`).
- Vercel project exists and is deployed at `https://budgetery.vercel.app` (preset Other, output `dist`, env `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` set, auto-deploy on every `main` push). Code-side env plumbing (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`) is done. Remaining: production origin in Google console (see §4). Docs site (`_config.yml`, `GITHUB_PAGES_WEBSITE_DESIGN.md`) uses GitHub Pages **deploy-from-branch on repo root** for Markdown docs — a separate concern from hosting the app.

### 2.2 Auth / sync building blocks (done, reusable)

| Piece | Location | Status |
|---|---|---|
| Google OAuth flow | `store/sync/googleAuth.ts` (`Google.useAuthRequest`, `expo-auth-session/providers/google`, `expo-web-browser`) | ✅ done (M2), verified on web Sep 2026 |
| Client IDs | `store/sync/googleConfig.ts` (`GOOGLE_WEB_CLIENT_ID` hardcoded; iOS/Android `undefined`) | ✅ web works; native pending |
| Scope | `drive.file` (least privilege) + default `openid email profile` | ✅ correct, keep |
| Token vault | `store/sync/tokenStore.ts` (SecureStore native / in-memory web) | ✅ done; web sessions are memory-only by design |
| Sync state in Store | `syncConfig` / `syncStatus` (`store/sync/types.ts`), persisted via `cleanStoreForStorage()` in `store/persistence/service.ts` | ✅ minimal sync done (default folder, manual Sync now) |
| Cloud project guide | `docs/design/GOOGLE_CLOUD_SETUP.md` | ✅ exists; production origin still to be registered (see §4) |
| Google sign-in (Drive only) | `app/config.tsx` (`config-connect/disconnect`), `useGoogleAuth` | ✅ kept — Drive-sync connector, no app lock |

### 2.3 Key insight for the login ask

~80% of a "Google login" is already built — but it was built as a **Drive-sync connector** (config screen, optional), not as an **app lock**. The design below turns the same OAuth identity into the gate, without adding Firebase Auth / Clerk / Auth0 / Supabase / any backend.

## 3. Hosting decision

### 3.1 Requirements

- Serves `expo export` static output (`dist/`) as-is; SPA-style deep links (`/tabs`, `/tabs/expenses`, `/config`) must resolve.
- Free tier, no credit card; preview deploys; custom-domain-ready; zero/low config.
- Must NOT clash with the existing docs site (GitHub Pages serves Jekyll from repo root at `handleman.github.io/budgetery/`).

### 3.2 Options compared

| Host | Free static + Expo fit | SPA fallback | Why / why not |
|---|---|---|---|
| **Vercel (recommended)** | ✅ `expo export` output served natively; Framework preset "Other", build `npx expo export --platform web --output-dir dist`, output dir `dist` | ✅ automatic (static `.html` per route + clean-URL rewrites, no config needed for `expo-router/static`) | Free hobby tier, preview URL per PR, env vars UI, best DX for this stack. **Pick this.** |
| Cloudflare Pages (runner-up) | ✅ free, generous bandwidth, fast | ✅ needs `_routes` / SPA fallback config | Equally free; slightly more config, dashboard UX weaker for Expo. Use if Vercel limits ever bite. |
| Netlify | ✅ free static + `_redirects` SPA rule | ⚠️ needs explicit `/* /index.html 200` rule | Fine, but no advantage over Vercel here. |
| GitHub Pages | ⚠️ possible (`404.html` SPA hack, `web.baseUrl` juggling) | ❌ no true rewrites | **Reject for the app**: conflicts with the docs-site Pages source on the same repo/branch, hacky routing, no previews/env vars. Keep Pages for docs only. |
| Firebase Hosting | ✅ good SPA support | ✅ rewrites config | Requires Firebase project + CLI + Blaze questions for anything beyond static; overkill and violates minimal-dependency goal. Reject. |

### 3.3 Recommendation

**Vercel, Hobby plan, project rooted at the repo, connected to the `budgetery` GitHub repo.**

- Build: install `npm ci`, build `npx expo export --platform web --output-dir dist`, output `dist`, Node 20+.
- No `vercel.json` needed for v1 (defaults serve static export correctly). Only add one later if deep-link edge cases appear.
- Env var (see §4): `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — requires moving the hardcoded ID in `googleConfig.ts` to `process.env` (small refactor, keeps the secret-free model: client IDs are public identifiers).
- Cost: $0. Limits that don't matter here: 100 GB bandwidth/mo, 6k build-min/mo dwarf a personal budget app. Native apps (later) are unaffected.

## 4. Hosting implementation plan (M1)

1. **Code prep (small):**
   - `googleConfig.ts`: read web client ID from `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` with the current literal as dev fallback. No secret ever committed.
   - Register `app/config.tsx` in `app/_layout.tsx` Stack (currently missing) while routes are being touched.
   - Confirm `dist/` stays gitignored; Vercel builds from source (never commit build output).
2. **Google Cloud console (owner, ~5 min — only remaining step):** add the production origin `https://budgetery.vercel.app` to **Authorised JavaScript origins + redirect URIs** of the `budgetery-web` client (companion to `GOOGLE_CLOUD_SETUP.md` Step 6; `redirect_uri_mismatch` otherwise). Keep `http://localhost:8081` for dev.
3. **Vercel ✅ done 2026-09-28:** repo imported → preset Other → build/output as §3.3 → env var set → deployed at `https://budgetery.vercel.app`, auto-deploy on every `main` push. Note preview deployments get distinct URLs — Google rejects unregistered origins, so **test Drive-connect only on localhost + production**, not on preview URLs (or register one stable preview domain).
4. **Verify:** `npx tsc --noEmit`, `npx jest --silent --runInBand`, `npx expo export --platform web --output-dir dist`; then Playwright smoke on production URL (welcome renders, tabs navigate, console clean).

## 5. Login design (REMOVED 2026-09-28 — record only)

The sections below designed an app lock that was built, manually verified,
then deleted: with no backend and all data on-device, a lock is theater.
Google OAuth remains only as the Drive-sync connector (§5.5 still current).

### 5.1 Non-goals / rejected alternatives

- **No Firebase Auth / Clerk / Auth0 / Supabase / custom backend.** Each adds an SDK, a vendor, a user table, and a second source of truth for data the user already keeps in their own Drive. The existing Google OAuth + Drive file *is* the identity + storage backend.
- **No Vercel Password Protection / Cloudflare Access as the gate.** Paywalled (Vercel) or single-shared-credential (both); neither gives per-user Drive sync. Reject.
- **No Google Cloud KMS / Identity-Aware Proxy.** Needs a backend/service account — contradicts static-only hosting.

### 5.2 Threat model (be honest about what a gate can do)

- **Attack 1 — casual viewer** (friend/family opens the URL on your laptop): a login screen + session gate fully solves this.
- **Attack 2 — same-browser devtools reader** (someone opens IndexedDB on an unlocked browser): a UI-only gate does **nothing** — local data is plaintext. This needs **encryption-at-rest** (§5.4, phased).
- Out of scope: stolen-device forensics, keyloggers, Google-account compromise (inherits Google's own security).

So the plan is two layers: **v1 soft gate (UX lock)** → **v2 hard privacy (encrypted store)**. Ship v1 with hosting; add v2 before storing anything truly sensitive online.

### 5.3 V1 — Google login as app lock (no new dependencies)

**Concept:** the Drive-sync Google identity becomes the entry ticket. `syncStatus.connected` (already in the Store) drives an `AuthGate`; unauthenticated users see only a login screen.

**Local switch (login OFF for debugging, ON by default):** `isAuthDisabled()`
in `components/auth/gate.ts` disables the gate when either switch position
is set — build-time `EXPO_PUBLIC_LOCAL_AUTH_OFF=1` (e.g. login-free
`npx expo start --web`; never set in production builds) or runtime
localStorage `budgetery.auth.disabled=1` **in dev builds only** (flippable
from the dev-only `config-auth-switch` toggle on the config screen,
`__DEV__` only, no rebuild; toggling navigates to `/` so the gate
re-evaluates). Production exports ignore both localStorage flags (and the
E2E seam) entirely — defense in depth. E2E runs a dev-flagged bundle
(`npm run e2e:build` uses `expo export --dev`), which never ships.

- **New route `app/login.tsx`** (Stack screen, header hidden like tabs):
  - Title + one-line privacy note ("Your data lives in your own Google Drive, this device keeps only a local copy").
  - `Connect with Google` button reusing `useGoogleAuth().connect` — **same hook, same `drive.file` scope, zero new OAuth config**. `testID="login-connect"`, error line `testID="login-error"`.
  - On `connected=true` → `router.replace('/')` (welcome) — mirrors the existing `router.replace('/tabs…')` pattern.
- **`AuthGate` in `app/_layout.tsx`:** wraps the Stack; when `!connected` and route isn't `/login`, redirects to `/login`. Shows nothing (splash) while the `loadTokens()` restore in `useGoogleAuth` resolves, so refresh doesn't flash the login screen when a valid session exists.
- **Lock action:** reuse `disconnect()` (already clears tokens) + add "Lock" button on welcome/config (`testID="welcome-lock"` / `config-disconnect` exists) → `router.replace('/login')`. Decide in implementation whether Lock also wipes the local store copy (privacy) or keeps it (convenience) — default **keep in v1, wipe option in v2**.
- **Web session behavior (unchanged, document it):** tokens are memory-only on web → refresh = re-login. Acceptable for v1 (matches M2 design); the login screen makes re-auth a first-class flow instead of an error state.
- **Tests:** reducer/guard unit tests (pure logic, fits Jest store-only strategy) + Playwright fake-auth flow (stub `promptAsync`, never hits Google in CI) with `data-testid` selectors per repo convention.

### 5.4 V2 — real privacy: encrypted local copy (still zero new deps)

V1 leaves IndexedDB plaintext. V2 encrypts the persisted payload with the **Web Crypto API** (built into browsers/React Native — no npm package):

- Key derivation: `SHA-256(access_token)` or `PBKDF2(passphrase)` — key lives in memory only, never in storage. Simplest coherent choice: derive from the Google `access_token` (proves identity, zero new UX); optional user passphrase as later hardening.
- Change is confined to `store/persistence/`: wrap `cleanStoreForStorage()` output in `AES-GCM encrypt` on `save` / decrypt on `load` via a new `CryptoAdapter` decorator around the existing adapters (`IStorageAdapter` contract unchanged — the modular design from `PERSISTENCE_LAYER_DESIGN.md` pays off here).
- Lock then = drop key from memory (+ optionally `clear()` local copy); unlock = login → fetch key → decrypt the local copy.

### 5.5 What Google Cloud tools are / aren't useful

- **Useful, already adopted:** Google OAuth2 (identity), Drive v3 REST via `fetch` (storage), `userinfo` endpoint (email display). Nothing more is needed for auth+sync.
- **Not needed:** Firebase Auth/Firestore, Cloud KMS, Secret Manager, IAP — all require a backend or move data off the user's Drive, violating static-only + minimal-dependency + "data lives with the user" principles.

## 6. Milestones & verification

- **M1 — hosting:** ✅ code done 2026-09-26 (env-var client ID, registered `config` route, static export verified); ✅ deployed 2026-09-28 at `https://budgetery.vercel.app` (auto-deploy on `main` push); ⬜ only production origin in Google console remaining.
- **M2 — login gate (v1):** ~~built, verified, then~~ **REMOVED 2026-09-28** (no backend → lock is theater; Drive connect in config stays).
- **M3 — Drive sync:** ✅ done minimal 2026-09-27 (fixed default folder, manual Sync now; picker / conflict backups / auto-sync dropped; no remote pull on unlock).
- **M4 — encryption (v2):** `CryptoAdapter`, lock-wipes-local option, updated test plan.
- Docs touched: this file (new, `nav_order: 12`), `docs/design/index.md` (link), `GOOGLE_CLOUD_SETUP.md` (production origin step), README deploy badge (optional).

## 7. Risks & open questions

1. **Preview-URL OAuth fails** unless origins are registered — constrain Drive-connect testing to localhost + production (documented above).
2. **Testing-mode refresh expiry (~7 days)** forces reconnect in config — acceptable for a manual backup feature.
3. ~~**V1 is a soft lock** (devtools can read IndexedDB) — must be stated in the login-screen copy and README until M4 lands; do not oversell it.~~ Removed with the lock — local data is openly on-device by design.
4. **Single-user assumption:** one Google account per browser profile. Multi-account switching = disconnect + reconnect; no account picker UI.
5. **`expo-auth-session` web implicit flow** returns short-lived tokens with no refresh — session length equals token lifetime; native code flow (refresh tokens, SecureStore) arrives with native builds.
