import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';

import { useColorScheme } from '@/hooks/useColorScheme';
import AppContextProvider from '@/store/context';
import { AuthGate } from '@/components/auth/AuthGate';
import { getPaperTheme } from '@/components/ui/paperTheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const paperTheme = useMemo(() => getPaperTheme(colorScheme), [colorScheme]);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    // P10: boot indicator instead of a blank gap while fonts load
    // (plain RN ActivityIndicator — no theme provider mounted yet).
    return (
      <View style={styles.bootLoader}>
        <ActivityIndicator size="large" testID="app-boot-loader" />
      </View>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppContextProvider>
        <AuthGate>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Welcome to Budgetery' }} />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          <Stack.Screen name="config" options={{ title: 'Configuration' }} />
          <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        </AuthGate>
      </AppContextProvider>
    </ThemeProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  bootLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
