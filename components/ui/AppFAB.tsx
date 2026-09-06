import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

type Props = {
  onPress: () => void;
  icon?: string;
  label?: string;
  testID?: string;
};

/** Adapter: primary add-action. */
export function AppFAB({ onPress, icon = 'plus', label, testID }: Props) {
  return <FAB icon={icon} label={label} onPress={onPress} style={styles.fab} testID={testID} />;
}

const styles = StyleSheet.create({
  fab: {
    marginVertical: 12,
  },
});
