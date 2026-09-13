import type { PropsWithChildren, ReactElement } from 'react';
import { ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import { ThemedView } from '@/components/ThemedView';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

/**
 * Static header + scrollable content.
 *
 * Previously this used react-native-reanimated (useScrollViewOffset /
 * Animated.ScrollView) for a parallax effect, but the animated scroll view
 * suspends during expo-router static rendering: the whole tab screen fell
 * into a Suspense boundary (React error #419), so exported HTML contained
 * an empty `<template>` — no tutorial content, no header image — and
 * Ionicons in the tab bar stayed empty until client hydration recovered.
 * A plain ScrollView renders identically on server and client, so headers,
 * tutorial copy and icons are present in every run (`npm run web`,
 * `expo export`, native dev).
 */
export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
          ]}>
          {headerImage}
        </View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
