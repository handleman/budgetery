import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

/**
 * Static wave adornment.
 *
 * Previously an animated `react-native-reanimated` loop; the animated view
 * suspended during expo-router static rendering (React error #419), leaving
 * the income tutorial screen empty in exported HTML. A static glyph renders
 * identically on server and client.
 */
export function HelloWave() {
  return <ThemedText style={styles.text}>👋</ThemedText>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});
