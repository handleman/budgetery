import * as React from 'react';
import { Dialog, Portal, Button } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  actions?: { label: string; onPress: () => void }[];
  testID?: string;
};

/** Adapter: Paper Dialog + Portal. Replaces `react-native-modal` usage. */
export function AppDialog({ visible, onDismiss, title, children, actions = [], testID }: Props) {
  if (!visible) return null;
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} testID={testID}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>{children}</Dialog.Content>
        {actions.length > 0 && (
          <Dialog.Actions>
            {actions.map((a) => (
              <Button key={a.label} onPress={a.onPress}>
                {a.label}
              </Button>
            ))}
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
}
