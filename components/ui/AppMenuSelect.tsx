import * as React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, List, Menu, Portal, useTheme } from 'react-native-paper';
import { DIALOG_MAX_WIDTH } from './AppDialog';

export type MenuSelectOption = {
  label: string;
  value: number;
};

type Props = {
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  value: number | null;
  options: MenuSelectOption[];
  onSelect: (value: number) => void;
  /** Stable selector root: anchor gets `${testID}-anchor`, each item `${testID}-option-${value}`. */
  testID?: string;
};

/**
 * Adapter: month/option picker.
 * Native keeps the Paper Menu dropdown. Web renders a custom option sheet
 * (Dialog + our own full-width rows): Paper Menu's anchored overlay
 * misbehaves on small touch browsers — width clipping at the anchor,
 * no scroll for long option lists, dismiss races on iOS Safari.
 * The sheet has no anchor positioning at all, so none of that applies.
 * The option list mounts only while open, same as the Menu overlay did.
 */
export function AppMenuSelect({ placeholder = 'Select an option', value, options, onSelect, testID }: Props) {
  const [visible, setVisible] = React.useState(false);
  const theme = useTheme();
  const selected = options.find((o) => o.value === value);
  const choose = (next: number) => {
    onSelect(next);
    setVisible(false);
  };

  if (Platform.OS === 'web') {
    return (
      <>
        <Button
          mode="outlined"
          icon="chevron-down"
          onPress={() => setVisible(true)}
          testID={testID ? `${testID}-anchor` : undefined}
        >
          {selected ? selected.label : placeholder}
        </Button>
        {visible && (
          <Portal>
            <Dialog
              visible={visible}
              onDismiss={() => setVisible(false)}
              testID={testID}
              style={styles.sheet}
            >
              <Dialog.Title>{selected ? selected.label : placeholder}</Dialog.Title>
              <Dialog.ScrollArea style={styles.scroll}>
                <ScrollView>
                  {options.map((option) => (
                    <List.Item
                      key={option.value}
                      title={option.label}
                      testID={testID ? `${testID}-option-${option.value}` : undefined}
                      onPress={() => choose(option.value)}
                      left={
                        option.value === value
                          ? () => <List.Icon icon="check" />
                          : undefined
                      }
                      style={
                        option.value === value
                          ? { backgroundColor: theme.colors.primaryContainer }
                          : undefined
                      }
                    />
                  ))}
                </ScrollView>
              </Dialog.ScrollArea>
            </Dialog>
          </Portal>
        )}
      </>
    );
  }

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchorPosition="bottom"
      testID={testID}
      anchor={
        <Button
          mode="outlined"
          icon="chevron-down"
          onPress={() => setVisible(true)}
          testID={testID ? `${testID}-anchor` : undefined}
        >
          {selected ? selected.label : placeholder}
        </Button>
      }
    >
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          title={option.label}
          testID={testID ? `${testID}-option-${option.value}` : undefined}
          onPress={() => {
            onSelect(option.value);
            setVisible(false);
          }}
        />
      ))}
    </Menu>
  );
}

const styles = StyleSheet.create({
  sheet: {
    // Same web cap as AppDialog: full width on phones, centered card on wide.
    width: '100%',
    maxWidth: DIALOG_MAX_WIDTH,
    alignSelf: 'center',
  },
  scroll: {
    maxHeight: 420,
    paddingHorizontal: 0,
  },
});
