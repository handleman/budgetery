---
title: Native builds
nav_order: 10
parent: Design docs
---

# Native Builds Setup Plan (iOS + Android) — implement someday

Goal: produce installable native builds of Budgetery for on-device testing (required for Google sign-in verification — Expo Go auth is unreliable) and, later, store distribution. Until then the app stays web-first; nothing here blocks web development or the Drive sync web flow.

Companion docs: `GOOGLE_CLOUD_SETUP.md` (Step 7 references this plan), `GOOGLE_DRIVE_SYNC_DESIGN.md` (M2 needs a dev build).

## 0. Starting point (verified Sep 2026)

- `app.json`: `slug: budgetery`, `scheme: myapp`, `version: 1.0.0` — **no** `ios.bundleIdentifier`, **no** `android.package`.
- No `eas.json`, no EAS CLI, no `expo-dev-client`, no native directories (managed workflow).

## 1. Decisions to lock before starting

| Decision | Proposal | Why |
|---|---|---|
| Bundle ID / package | `com.handleman.budgetery` (both platforms) | must match the Google iOS/Android OAuth clients exactly; reverse-DNS, never change after first release |
| Deep-link scheme | keep `myapp` | already in `app.json`; used as the OAuth redirect (`myapp://`) |
| Build service | EAS Build (`eas.json` profiles) | keeps the managed workflow (no `android/`/`ios/` folders to maintain); local `expo run:*` as fallback |
| Test vehicle | `expo-dev-client` development builds | Expo Go cannot reliably test Google sign-in; dev builds load the same JS over the LAN |
| EAS project owner | your Expo account (free tier suffices for dev/preview builds) | `owner` + `projectId` go into `app.json`/`eas.json` on `eas build:configure` |

Cost notes: Android builds and testing are free. iOS **simulator/local** testing needs only Xcode + a free Apple ID; iOS **device** builds and any App Store distribution need the paid Apple Developer Program (totals ~$99/yr) — not required until device testing.

## 2. app.json changes

```json
{
  "expo": {
    "owner": "<your-expo-username>",
    "ios": { "bundleIdentifier": "com.handleman.budgetery", "supportsTablet": true },
    "android": { "package": "com.handleman.budgetery" }
  }
}
```

`scheme: myapp` stays. Bump `version` / add `ios.buildNumber` + `android.versionCode` only when cutting release builds (later milestone, not day one).

## 3. EAS setup

1. Install/login: `npm i -g eas-cli` (or `npx eas-cli`), `eas login`, then `eas build:configure` in the repo root — generates `eas.json` and links `extra.eas.projectId`.
2. Profiles to define in `eas.json`:
   - `development` — `developmentClient: true`, `distribution: internal` (the daily driver for auth testing);
   - `preview` — internal APK (Android) / simulator or TestFlight (iOS) for sharing test builds;
   - `production` — store builds (much later; needs the paid Apple account for iOS).
3. Add the runtime dependency: `npx expo install expo-dev-client` (JS side of the dev client).
4. Commit `eas.json` + `app.json` changes; never commit `credentials.json` or keystores (EAS manages them server-side by default).

## 4. First builds + fingerprints

1. Android first (no paid account): `eas build -p android --profile development` → install the APK on a device/emulator → `npx expo start --dev-client` → open via QR/URL.
2. Collect SHA-1 fingerprints and register **all of them** on the single Google Android OAuth client (multiple fingerprints per client are allowed):
   - local debug keystore: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`;
   - EAS cloud keystore: `eas credentials -p android` → fingerprint shown there (EAS-managed keystore is the default);
   - any release keystore later, when it exists.
3. iOS: `eas build -p ios --profile development` (needs the Apple account for device installs; simulator-only check can alternatively use Xcode + `npx expo run:ios` with a free Apple ID). Create the Google iOS OAuth client with bundle ID `com.handleman.budgetery` — no SHA-1/redirect URIs needed on iOS.
4. Record the three Google client IDs and hand them to development with explicit confirmation (repo security rule) — same handoff as `GOOGLE_CLOUD_SETUP.md` Step 8.

## 5. Verification (ties into sync plan M2)

On the dev build: welcome → config screen → Connect → system browser Google login → consent → back into the app (`myapp://` redirect) → account email shown, folder created in the user's Drive. Repeat on Android; iOS once its build exists. Any `redirect_uri_mismatch`/fingerprint error means the console entry (Step 6/7 of the setup guide), not app code — fix console first.

## 6. Explicit non-goals for this plan

- No App Store / Play publishing setup (store listings, review, release signing ceremony) — separate milestone when distribution is wanted.
- No OTA Updates configuration (`expo-updates` channels) — decide with the first preview build, not before.
- No `expo prebuild` / bare workflow — EAS keeps native projects generated; ejecting is out of scope.
