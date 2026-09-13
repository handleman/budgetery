import * as React from 'react';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onPress: () => void;
  /** Stable selector, e.g. `income-back-button`. */
  testID?: string;
};

/**
 * Adapter: round icon-only back button pinned to the top-left corner,
 * above the screen header image. Navigates to the welcome screen
 * (tracked-months list + start-new-month inputs).
 */
export function AppBackButton({ onPress, testID }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <IconButton
      icon="arrow-left"
      mode="contained"
      size={24}
      onPress={onPress}
      testID={testID}
      style={[styles.button, { top: insets.top + 8 }]}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
});
