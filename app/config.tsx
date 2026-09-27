import { useContext, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppButton, AppCard, AppCardTitle, AppDivider } from '@/components/ui';
import { appContext } from '@/store/context';
import { useGoogleAuth } from '@/store/sync/googleAuth';
import { DriveError } from '@/store/sync/driveClient';
import { syncNow } from '@/store/sync/syncService';
import { loadTokens } from '@/store/sync/tokenStore';

export default function ConfigScreen() {
    const ctx = useContext(appContext);
    const router = useRouter();
    const { lastSync, lastError } = ctx.store.syncStatus;
    const { connected, email, busy, canPrompt, connect, disconnect } = useGoogleAuth();
    const [syncing, setSyncing] = useState(false);

    const lockHandler = async () => {
        await disconnect();
        router.replace('/login');
    };

    const fail = (message: string) => {
        ctx.mutators.setSyncStatus({ ...ctx.store.syncStatus, lastError: message });
    };

    const syncNowHandler = async () => {
        if (syncing) return;
        setSyncing(true);
        try {
            const tokens = await loadTokens();
            if (!tokens || tokens.expiresAt <= Date.now()) {
                fail('Session expired — reconnect Google.');
                return;
            }
            const result = await syncNow(ctx.store, tokens.accessToken);
            const stamped = new Date().toISOString();
            if (result.direction === 'push') {
                ctx.mutators.setSyncConfig({ ...ctx.store.syncConfig, revision: result.revision });
                ctx.mutators.setSyncStatus({
                    ...ctx.store.syncStatus,
                    lastSync: stamped,
                    lastError: null,
                });
            } else {
                ctx.mutators.loadStore(result.store);
                ctx.mutators.setSyncConfig({ ...ctx.store.syncConfig, revision: result.revision });
                ctx.mutators.setSyncStatus({
                    ...ctx.store.syncStatus,
                    connected: true,
                    lastSync: stamped,
                    lastError: null,
                });
            }
        } catch (error) {
            if (error instanceof DriveError && error.status === 401) {
                fail('Session expired — reconnect Google.');
            } else {
                fail(error instanceof Error ? error.message : 'Sync failed.');
            }
        } finally {
            setSyncing(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <Stack.Screen options={{ title: 'Configuration' }} />
            <ScrollView contentContainerStyle={styles.content}>
                <AppCard testID="config-status">
                    <AppCardTitle title="Google Drive sync" subtitle={connected ? 'Connected' : 'Not connected'} />
                    <ThemedText>Account: {connected ? (email ?? 'Unknown account') : 'Not connected'}</ThemedText>
                    <ThemedText>Last sync: {lastSync ?? 'Never'}</ThemedText>
                    {lastError ? <ThemedText>Error: {lastError}</ThemedText> : null}
                </AppCard>
                <AppDivider />
                {connected ? (
                    <AppButton
                        title="Disconnect Google account"
                        mode="outlined"
                        onPress={lockHandler}
                        disabled={busy}
                        testID="config-disconnect"
                    />
                ) : (
                    <AppButton
                        title="Connect Google account"
                        onPress={connect}
                        disabled={busy || !canPrompt}
                        testID="config-connect"
                    />
                )}
                <AppDivider />
                <AppCard testID="config-drive-folder">
                    <AppCardTitle title="Drive folder" subtitle="Budgetery (default)" />
                    <ThemedText>
                        Backups sync to the Budgetery folder in your Google Drive.
                    </ThemedText>
                    {connected && (
                        <AppButton
                            title={syncing ? 'Syncing…' : 'Sync now'}
                            onPress={syncNowHandler}
                            disabled={busy || syncing}
                            testID="config-sync-now"
                        />
                    )}
                </AppCard>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 32,
        gap: 16,
    },
});
