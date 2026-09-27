import { useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { appContext } from '@/store/context';
import { defaultSyncStatus } from './types';
import {
    GOOGLE_ANDROID_CLIENT_ID,
    GOOGLE_DRIVE_FILE_SCOPE,
    GOOGLE_IOS_CLIENT_ID,
    GOOGLE_WEB_CLIENT_ID,
} from './googleConfig';
import { clearTokens, loadTokens, saveTokens } from './tokenStore';

WebBrowser.maybeCompleteAuthSession();

const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

async function fetchEmail(accessToken: string): Promise<string | null> {
    try {
        const res = await fetch(USERINFO_ENDPOINT, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return null;
        const body = (await res.json()) as { email?: unknown };
        return typeof body.email === 'string' ? body.email : null;
    } catch {
        return null;
    }
}

/**
 * Google account connect/disconnect for Drive sync (M2).
 * Web uses the implicit token flow; native will use the PKCE code flow
 * (auto-exchanged, refresh token persisted) once native client IDs exist.
 */
export function useGoogleAuth() {
    const ctx = useContext(appContext);
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_WEB_CLIENT_ID,
        iosClientId: GOOGLE_IOS_CLIENT_ID,
        androidClientId: GOOGLE_ANDROID_CLIENT_ID,
        scopes: [GOOGLE_DRIVE_FILE_SCOPE],
    });
    const [busy, setBusy] = useState(false);

    // Restore a persisted session (M2: valid access token only; silent
    // refresh with refresh_token arrives with the native code flow).
    useEffect(() => {
        let live = true;
        loadTokens().then((tokens) => {
            if (live && tokens && tokens.expiresAt > Date.now()) {
                ctx.mutators.setSyncStatus({
                    ...defaultSyncStatus,
                    connected: true,
                    email: tokens.email,
                });
            }
        });
        return () => {
            live = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Finish an interactive login.
    useEffect(() => {
        if (response?.type !== 'success') return;
        const params = response.params as { access_token?: unknown; expires_in?: unknown };
        const authentication = (response as { authentication?: unknown }).authentication as
            | { accessToken?: unknown; refreshToken?: unknown; expiresIn?: unknown }
            | undefined;
        const accessToken =
            (typeof authentication?.accessToken === 'string' && authentication.accessToken) ||
            (typeof params.access_token === 'string' && params.access_token) ||
            null;
        if (!accessToken) {
            ctx.mutators.setSyncStatus({
                ...ctx.store.syncStatus,
                lastError: 'Google sign-in returned no access token.',
            });
            return;
        }
        const rawExpires =
            (typeof authentication?.expiresIn === 'number' && authentication.expiresIn) ||
            Number(params.expires_in) ||
            3600;
        const finish = async () => {
            const email = await fetchEmail(accessToken);
            await saveTokens({
                accessToken,
                refreshToken:
                    typeof authentication?.refreshToken === 'string'
                        ? authentication.refreshToken
                        : undefined,
                expiresAt: Date.now() + rawExpires * 1000 - 60_000,
                email,
            });
            ctx.mutators.setSyncStatus({
                ...defaultSyncStatus,
                connected: true,
                email,
            });
        };
        void finish();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);

    const connect = async () => {
        setBusy(true);
        try {
            await promptAsync();
        } finally {
            setBusy(false);
        }
    };

    const disconnect = async () => {
        await clearTokens();
        ctx.mutators.setSyncStatus({ ...defaultSyncStatus });
    };

    return {
        connected: ctx.store.syncStatus.connected,
        email: ctx.store.syncStatus.email,
        busy,
        canPrompt: !!request,
        connect,
        disconnect,
    };
}
