import { useContext } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AppButton, AppCard, AppCardTitle, AppDivider } from '@/components/ui';
import { appContext } from '@/store/context';
import { useGoogleAuth } from '@/store/sync/googleAuth';

export default function ConfigScreen() {
    const ctx = useContext(appContext);
    const { lastSync, lastError } = ctx.store.syncStatus;
    const { connected, email, busy, canPrompt, connect, disconnect } = useGoogleAuth();

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
                        onPress={disconnect}
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
                    <AppCardTitle title="Drive folder" subtitle="Coming in the next update" />
                    <ThemedText>
                        Folder selection and automatic synchronization arrive in the next update.
                    </ThemedText>
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
