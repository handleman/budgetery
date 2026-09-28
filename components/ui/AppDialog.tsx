import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Dialog, Portal, Button, useTheme } from 'react-native-paper';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
  actions?: { label: string; onPress: () => void }[];
  testID?: string;
  /** Fill color for the Save action (mockup CTA); other actions stay text. */
  saveButtonColor?: string;
};

/**
 * Adapter: Paper Dialog + Portal. Corner radius follows theme roundness (S1).
 * The Save action renders as a contained CTA button when saveButtonColor is
 * set (redesign P4); Back/Delete stay text buttons.
 *
 * On web the dialog is capped at DIALOG_MAX_WIDTH and centered — without the
 * cap Paper stretches it across wide viewport layouts (sidebar + content).
 * Native keeps Paper's default sizing.
 */
export function AppDialog({ visible, onDismiss, title, children, actions = [], testID, saveButtonColor }: Props) {
  const theme = useTheme();
  if (!visible) return null;
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} testID={testID} style={[styles.dialog, { borderRadius: theme.roundness }]}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>{children}</Dialog.Content>
        {actions.length > 0 && (
          <Dialog.Actions>
            {actions.map((a) =>
              a.label === 'Save' && saveButtonColor ? (
                <Button
                  key={a.label}
                  mode="contained"
                  buttonColor={saveButtonColor}
                  textColor="#FFFFFF"
                  onPress={a.onPress}
                  testID={testID ? `${testID}-action-${a.label.toLowerCase()}` : undefined}
                >
                  {a.label}
                </Button>
              ) : (
                <Button
                  key={a.label}
                  onPress={a.onPress}
                  testID={testID ? `${testID}-action-${a.label.toLowerCase()}` : undefined}
                >
                  {a.label}
                </Button>
              ),
            )}
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
}

/** Shared narrow-content cap (dialogs, welcome form): full width on phones, centered card on wide screens. */
export const DIALOG_MAX_WIDTH = 560;

const styles = StyleSheet.create({
  dialog: {
    // Web-only cap: full width on narrow screens, centered card on wide ones.
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: DIALOG_MAX_WIDTH,
        alignSelf: 'center',
      },
      default: {},
    }),
  },
});
