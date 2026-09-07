import * as React from 'react';
import { Menu, Button } from 'react-native-paper';

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
 * Adapter: Paper Menu dropdown. Replaces `react-native-picker-select`.
 * Overlay mounts only while open, so no Paper Portal is needed when closed.
 */
export function AppMenuSelect({ placeholder = 'Select an option', value, options, onSelect, testID }: Props) {
  const [visible, setVisible] = React.useState(false);
  const selected = options.find((o) => o.value === value);

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
