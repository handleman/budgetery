---
title: Cloud setup
nav_order: 9
parent: Design docs
---

# Google Cloud Setup for Budgetery Drive Sync — Step-by-Step Guide

Goal: register the Budgetery app with Google so users can sign in and sync to **their own personal Google Drives**. This is free, takes ~15 minutes, and stores no user data — it only creates the app's identity (OAuth client IDs).

Prerequisite: any Google account (a personal Gmail is fine).

## Step 1 — Create the project

1. Go to `https://console.cloud.google.com/`.
2. Top-left project picker → **New project**.
3. Name: `Budgetery` (the numeric suffix Google appends to the project ID is fine, ignore it).
4. No organization needed; skip billing prompts (not required for OAuth).
5. Select the new project in the picker.

## Step 2 — Enable the Google Drive API

1. Left menu → **APIs & Services → Library**.
2. Search `Google Drive API` → open it → **Enable**.
3. (Without this, the Auth Platform section may not appear.)

## Step 3 — Configure the consent screen (Get Started wizard)

1. Go to **APIs & Services → Google Auth Platform** (the 2024+ name for "OAuth consent screen").
2. Fresh project shows "not configured yet" → click **Get started** (4-step wizard, one page):
   - **App Information**: App name `Budgetery` (users see this at login); User support email = your email.
   - **Audience**: choose **External** (any Google account; starts in Testing mode). ⚠️ Cannot be changed later — do NOT pick Internal (that blocks all non-Workspace accounts).
   - **Contact Information**: your email for Google policy notices.
   - **Finish**: accept the User Data Policy → **Create**.

## Step 4 — Add yourself as a test user

1. In Google Auth Platform → **Audience** tab → **Test users** → **Add users**.
2. Add your Gmail (plus any tester emails, max 100 while in Testing mode).
3. Without this, login fails with `access_blocked` / `403 access_denied`.

## Step 5 — Add the Drive scope

1. Go to **Data Access** tab → **Add or remove scopes**.
2. Check `https://www.googleapis.com/auth/drive.file` ("See, edit, create, and delete only the specific Google Drive files you use with this app") → **Update** → **Save**.
3. (`openid`, `email`, `profile` are included by default; do NOT add full `drive` scope.)

## Step 6 — Create the Web client ID (unblocks web testing now)

1. Go to **Clients** tab → **Create Client**.
2. Application type: **Web application**; name: `budgetery-web`.
3. **Authorised JavaScript origins**: add `http://localhost:8081` (dev server).
4. **Authorised redirect URIs**: add `http://localhost:8081` (add the production origin here later when the web build is hosted).
5. **Create** → copy the **Client ID** (`...apps.googleusercontent.com`). No secret needed (the app uses the PKCE code flow).
6. If login later fails with `redirect_uri_mismatch`, copy the exact URI from the browser address bar into this list (match is character-exact: scheme, port, trailing slash).

## Step 7 — Create the iOS + Android client IDs (needed for native builds)

Do this now or when native builds are set up (see `NATIVE_BUILDS_SETUP_PLAN.md` for the full from-zero native plan) — but decide the IDs today:

- Package/bundle name to use everywhere: `com.handleman.budgetery` (we will add it to `app.json` in the implementation milestone; it must match exactly).
- **iOS**: Create Client → type **iOS** → Bundle ID `com.handleman.budgetery` → Create → copy the Client ID.
- **Android**: Create Client → type **Android** → package `com.handleman.budgetery` + **SHA-1** of your signing certificate:
  - dev builds via EAS: `eas credentials` shows the fingerprint;
  - local debug keystore: `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android`.
  - The SHA-1 can be added/edited later — the web client already unblocks development.

## Step 8 — Hand the IDs to development

Send the three Client IDs (web, iOS, Android) in chat. They are public identifiers and go into the app config in the implementation milestone — with your explicit confirmation, per repo security rules. Never create or share a client *secret*; this flow does not use one.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `access_blocked` / 403 at login | account not in **Test users** (Step 4) |
| `redirect_uri_mismatch` | register the exact URI incl. port and trailing slash (Step 6) |
| Auth Platform menu missing | wrong project selected, or Drive API not enabled (Step 2), or no Owner/Editor role |
| "Unverified app" warning at login | normal in Testing mode — click Advanced → proceed; disappears only after Google verification + publishing (needed only beyond 100 users) |
| Tokens stop working after ~7 days | normal expiry for test users in Testing mode — just sign in again |
