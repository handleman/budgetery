/**
 * Google OAuth client IDs for Drive sync.
 *
 * These are public application identifiers (shown in browsers), NOT secrets —
 * the app uses the PKCE code flow (native) / implicit flow (web), so no
 * client secret exists. iOS/Android IDs are added when native builds exist.
 */
export const GOOGLE_WEB_CLIENT_ID =
    '902898489600-r5tdegs1r6vtj78ol546352k5s61s38s.apps.googleusercontent.com';

export const GOOGLE_IOS_CLIENT_ID: string | undefined = undefined;
export const GOOGLE_ANDROID_CLIENT_ID: string | undefined = undefined;

/** Least-privilege scope: only files the app itself creates. */
export const GOOGLE_DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
