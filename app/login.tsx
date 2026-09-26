import { useContext, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppButton, AppCard } from '@/components/ui';
import { appContext } from '@/store/context';
import { useGoogleAuth } from '@/store/sync/googleAuth';

export default function LoginScreen() {
    const ctx = useContext(appContext);
    const router = useRouter();
    const { connected, busy, canPrompt, connect } = useGoogleAuth();
    const lastError = ctx.store.syncStatus.lastError;

    useEffect(() => {
        if (connected) router.replace('/');
    }, [connected, router]);

    return (
        <ThemedView style={styles.container}>
            <ThemedView style={styles.content}>
                <ThemedView testID="login-title">
                    <ThemedText type="title">Login to Budgetery</ThemedText>
                </ThemedView>
                <AppCard testID="login-info">
                    <ThemedText>
                        Your budget data lives in your own Google Drive — this device keeps only a local copy.
                        Sign in with Google to unlock the app.
                    </ThemedText>
                </AppCard>
                {lastError ? (
                    <ThemedView testID="login-error">
                        <ThemedText>Error: {lastError}</ThemedText>
                    </ThemedView>
                ) : null}
                <AppButton
                    title="Connect with Google"
                    onPress={connect}
                    disabled={busy || !canPrompt}
                    testID="login-connect"
                />
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
        justifyContent: 'center',
    },
});
