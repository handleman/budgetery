import * as React from 'react';
import { Dialog, Portal, Button, useTheme } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  actions?: { label: string; onPress: () => void }[];
  testID?: string;
};

/** Adapter: Paper Dialog + Portal. Corner radius follows theme roundness (S1). */
export function AppDialog({ visible, onDismiss, title, children, actions = [], testID }: Props) {
  const theme = useTheme();
  if (!visible) return null;
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} testID={testID} style={{ borderRadius: theme.roundness }}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>{children}</Dialog.Content>
        {actions.length > 0 && (
          <Dialog.Actions>
            {actions.map((a) => (
              <Button
                key={a.label}
                onPress={a.onPress}
                testID={testID ? `${testID}-action-${a.label.toLowerCase()}` : undefined}
              >
                {a.label}
              </Button>
            ))}
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
}
