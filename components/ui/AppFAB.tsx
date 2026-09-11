import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';

type Props = {
  onPress: () => void;
  icon?: string;
  label?: string;
  testID?: string;
  /** Tonal background (screen gamma). Defaults to theme primaryContainer. */
  backgroundColor?: string;
  /** Foreground (icon + label). Defaults to theme onPrimaryContainer. */
  color?: string;
};

/**
 * Adapter: primary add-action. Tonal extended FAB, centered in-flow
 * (never full-bleed) so it reads as an action, not a banner.
 */
export function AppFAB({ onPress, icon = 'plus', label, testID, backgroundColor, color }: Props) {
  return (
    <FAB
      icon={icon}
      label={label}
      onPress={onPress}
      color={color}
      style={[styles.fab, backgroundColor ? { backgroundColor } : undefined]}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  fab: {
    marginVertical: 12,
    marginHorizontal: 32,
  },
});
