import { useContext, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { appContext } from '@/store/context';
import { useGoogleAuth } from '@/store/sync/googleAuth';
import { isAuthDisabled, isE2EBypass, resolveGate } from './gate';

/**
 * Login gate: unauthenticated users see only /login.
 * Soft lock by design (see gate.ts) — keeps honest: no encryption yet.
 */
export function AuthGate({ children }: React.PropsWithChildren) {
    const ctx = useContext(appContext);
    const { restored, connected } = useGoogleAuth();
    const segments = useSegments();
    const router = useRouter();

    const segment = segments[0];
    const verdict = resolveGate({
        connected,
        bypassed: isE2EBypass() || isAuthDisabled(),
        restored,
        segment,
    });

    useEffect(() => {
        if (verdict === 'to-login') router.replace('/login');
        else if (verdict === 'to-home') router.replace('/');
    }, [verdict, router]);

    if (verdict === 'waiting') {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" testID="auth-gate-loader" />
            </View>
        );
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    loader: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
