import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type StoredTokens = {
    accessToken: string;
    /** Present on native (code flow); absent on web (implicit flow). */
    refreshToken?: string;
    /** Epoch ms when the access token expires. */
    expiresAt: number;
    email: string | null;
};

const KEY = 'budgetery.google.tokens';
const useSecureStore = Platform.OS !== 'web';
let memoryTokens: StoredTokens | null = null;

/** Persist Google OAuth tokens: SecureStore on native, memory on web. */
export async function saveTokens(tokens: StoredTokens): Promise<void> {
    if (useSecureStore) {
        try {
            await SecureStore.setItemAsync(KEY, JSON.stringify(tokens));
            return;
        } catch {
            // Fall through to memory (e.g. no device lock set).
        }
    }
    memoryTokens = tokens;
}

export async function loadTokens(): Promise<StoredTokens | null> {
    if (useSecureStore) {
        try {
            const raw = await SecureStore.getItemAsync(KEY);
            if (!raw) return memoryTokens;
            const parsed = JSON.parse(raw) as StoredTokens;
            if (typeof parsed?.accessToken === 'string') return parsed;
            return null;
        } catch {
            return memoryTokens;
        }
    }
    return memoryTokens;
}

export async function clearTokens(): Promise<void> {
    memoryTokens = null;
    if (useSecureStore) {
        try {
            await SecureStore.deleteItemAsync(KEY);
        } catch {
            // Already absent — nothing to do.
        }
    }
}
