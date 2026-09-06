import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { ThemedView } from '@/components/ThemedView';
import { AppButton } from './AppButton';

type Props = {
  title: string;
  description?: string;
  actionLabel: string;
  onAction: () => void;
  adornment?: React.ReactNode;
};

/** Adapter: tutorial/empty state block. */
export function AppEmptyState({ title, description, actionLabel, onAction, adornment }: Props) {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleRow}>
        <Text variant="titleLarge">{title}</Text>
        {adornment}
      </ThemedView>
      {description ? <Text variant="bodyMedium">{description}</Text> : null}
      <AppButton title={actionLabel} onPress={onAction} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
