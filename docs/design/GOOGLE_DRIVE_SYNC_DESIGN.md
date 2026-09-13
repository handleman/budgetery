# Google Drive Sync + Configuration Screen — Design Plan

## 1. Usecase analysis (added in `7e22a04`)

`docs/design/usecases.md` → new `## Configuration page` section:

- configuration screen exists, reachable from the main welcome screen via a distinctive button/menu link;
- in it, the user configures data synchronization with Google Drive, **selecting a Drive folder** where app data is stored.

Gaps in the current wording (assumptions made explicit in this plan):

- No sync direction/frequency stated → propose **offline-first, manual + auto sync** (§5).
- No conflict rule stated → propose **last-write-wins with a conflict backup** (§6).
- "Select a folder" vs Drive permission model → propose **least-privilege `drive.file` scope with app-created folders** (§4). A truly arbitrary-folder picker needs the full `drive` scope (scary consent screen, Google verification); the plan avoids it.

## 2. Investigation findings

### 2.1 What Expo already gives us

| Capability | Status |
|---|---|
| OAuth browser flow | `expo-web-browser` already installed |
| File I/O | `expo-file-system` already present (transitive) |
| Google OAuth | **NOT installed** → add `expo-auth-session` (JS-only, works iOS/Android/web). Provider `expo-auth-session/providers/google` takes per-platform `iosClientId` / `androidClientId` / `webClientId` + `scopes`, PKCE code flow |
| Token vault | **NOT installed** → add `expo-secure-store` (native); web fallback = in-memory + re-auth (no secret in `localStorage`) |
| Serialized store | exists: `cleanStoreForStorage()` in `store/persistence/service.ts` (Date→ISO, lossless round-trip) |
| Local adapters | `IStorageAdapter` + `StorageRegistry` (AsyncStorage / IndexedDB / session / mock) — Drive sync sits **above** this layer, not inside it |

### 2.2 Google Drive API v3 (REST, `fetch` with bearer token — no SDK needed)

- Upload: `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart` (metadata JSON + file JSON).
- Update: `PATCH .../files/{id}?uploadType=multipart`.
- List folders: `GET .../drive/v3/files?q=mimeType='application/vnd.google-apps.folder'&fields=files(id,name,modifiedTime)`.
- Download: `GET .../drive/v3/files/{id}?alt=media`.
- Scopes: `https://www.googleapis.com/auth/drive.file` (sees/creates only app-created files — least privilege, matches "select a folder" if the folder is app-created, see §4). Avoid full `drive` scope.

### 2.3 Constraints discovered

- **Google Cloud project is a user action**: OAuth client IDs (web + iOS + Android) must be created by the repo owner; consent screen runs in **testing mode** (≤100 test users) until/unless verified. Client IDs are public identifiers, but per repo security rules they are added only with explicit confirmation — never commit a client *secret*.
- **Expo Go + Google sign-in is unreliable** (redirect-URI handling); plan verification on **web + dev build** (`expo-dev-client`), not Expo Go.
- **Web** needs the production origin + `http://localhost:8081` registered as authorized JavaScript origins.
- Access tokens live ~1h → store the **refresh token** (SecureStore on native) and refresh silently; on web keep tokens in memory and re-prompt when expired.

## 3. Architecture

New `store/sync/` module (pure logic, unit-testable with injected `fetch`):

```
store/sync/
  driveClient.ts    # thin Drive v3 REST wrapper (list/create/upload/download), fetch injected
  tokenStore.ts     # SecureStore (native) / memory (web) for refresh_token + access_token
  syncService.ts    # policy: needsSync, push, pull, resolveConflict; reuses cleanStoreForStorage()
  types.ts          # SyncConfig { folderId, folderName, autoSync }, SyncStatus, SyncResult
```

- `SyncConfig` + `SyncStatus` live in the `Store` (new fields, default `{ connected: false }`) so UI reads them from context like everything else; new mutators (`setSyncConfig`, `setSyncStatus`) + reducer cases.
- `PersistenceService` unchanged: local save/load stays the source of truth; sync is an explicit layer that reads the store, pushes JSON, and dispatches `LOAD_STORE` on pull (migrations already run on load).
- Network failures never break local flows: sync errors surface as status (`error: string`), never throw into reducers.

## 4. Folder selection (least-privilege design)

1. First connect → app creates a `Budgetery` folder in Drive (via `drive.file` scope) and stores its `folderId` in `SyncConfig`.
2. Folder row shows current folder; "Change" lists **app-created folders** (`files.list` filtered to folders — all visible under `drive.file`) plus "Create new folder".
3. Sync file: `budgetery-backup.json` inside the chosen folder; identity tracked by Drive file id stored in config (not by name search).
4. Why not any user folder: writing into an arbitrary folder the user picks from a custom list requires the broad `drive` scope. If that becomes a requirement, it is a separate decision (consent + verification cost).

## 5. Sync policy

- **Offline-first**: every mutation saves locally (existing behavior); sync is additive.
- **Manual**: "Sync now" button in config screen; result + timestamp shown.
- **Auto** (toggle, default ON once configured): push debounced after local mutations + pull on app start when `connected`.
- **Direction decision per sync**: fetch remote metadata (`modifiedTime`, `appProperties.revision`) → if remote newer than `lastSync` AND local changed since `lastSync` → conflict (§6); else push or pull whichever side is newer; no-op when equal.

## 6. File format & conflicts

- Payload = `cleanStoreForStorage(store)` JSON + envelope `{ format: 'budgetery-backup/1', revision, updatedAt, deviceId }`. Revision = monotonic counter in `SyncConfig`, bumped on each push.
- **Conflict**: last-write-wins by `updatedAt`; the losing side is preserved as `budgetery-backup-conflict-<timestamp>.json` in the same folder and the status reports it. No silent data loss, no merge of item arrays (merge conflicts in budget items are out of scope).

## 7. Configuration screen spec

- Route: `app/config.tsx` → auto-registered Stack screen titled `Configuration` (header shown, unlike tabs).
- Entry: distinctive button on welcome screen (`app/index.tsx`), e.g. gear-labeled `AppButton` above the month picker, `testID="welcome-config"`.
- Contents (all Paper adapters, `testID` per convention):
  - status card (`config-status`): account email or "Not connected", last sync time, last error;
  - connect/disconnect (`config-connect`, `config-disconnect`) — OAuth via system browser;
  - folder row (`config-folder-name`, `config-folder-change`) + folder list (`config-folder-row-N`) + create (`config-folder-create`);
  - Sync now (`config-sync-now`), auto-sync switch (`config-auto-sync-switch`).
- Back navigation: Stack header back (platform default) returns to welcome — no custom back button needed (unlike tabs, which hide the Stack header).

## 8. Milestones & testing

- **M1 — shell**: ✅ done (config screen, welcome entry, store fields, no network).
- **M2 — auth**: ✅ done (expo-auth-session Google flow, tokenStore, connect/disconnect + email; verified end-to-end on web Sep 2026).
- **M3 — folder + push/pull**: `driveClient` (list/create/upload/download), folder selection, manual sync, conflict backup. Unit tests with stubbed `fetch` (pure logic, no rendering — fits the Jest store-only strategy).
- **M4 — auto-sync**: debounced push, pull-on-start, status/error surfacing, migration for new store fields.
- **M5 — E2E + docs**: Playwright flows with a fake Drive transport (never hits real Google in CI), TEST_COVERAGE + README updates.
- Verify trio each milestone: `npx tsc --noEmit`, `npx jest --silent --runInBand`, `npx expo export --platform web --output-dir dist`.

## 9. Risks & open questions

1. **Google Cloud setup** (owner action, one-time, free): the Cloud project is only the app's *identity* for Google's login screen — user data still lives exclusively in each user's own personal Drive, nothing flows through the project. Needed: project, OAuth client IDs per platform, testing-mode test users, authorized origins. Blocks M2 — needs confirmation before any credential touches the repo.
2. **Expo Go won't verify native auth** — require `expo-dev-client` for M2+ device testing.
3. **`drive.file` vs arbitrary folders** — current plan covers app-created folders only; full-drive scope is a deliberate non-goal unless requested.
4. **Web refresh tokens** — in-memory only; long sessions re-prompt. Acceptable for a backup feature; alternatives (own token-exchange backend) are out of scope.
5. **Quota** — Drive API default quotas dwarf a manual/debounced backup workload; no action unless auto-sync interval goes below ~1 min.
