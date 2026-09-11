import * as React from 'react';
import { BottomNavigation } from 'react-native-paper';
import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

/**
 * PaperTabBar — Material Design 3 bottom bar (Paper `BottomNavigation.Bar`)
 * driving the expo-router tab navigator. Routing stays on expo-router;
 * only the bar chrome is Paper. Icons come from each screen's `tabBarIcon`
 * (existing Ionicons), labels from `title`, testIDs from
 * `tabBarButtonTestID` (E2E contract preserved).
 */
export function PaperTabBar({ navigation, state, descriptors, insets }: TabBarProps) {
  const colorScheme = useColorScheme();
  return (
    <BottomNavigation.Bar
      navigationState={{
        index: state.index,
        routes: state.routes.map((route) => ({
          key: route.key,
          title: descriptors[route.key]?.options.title,
        })),
      }}
      shifting={false}
      activeColor={Colors[colorScheme].tint}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (event.defaultPrevented) {
          preventDefault();
          return;
        }
        // `route` is the Paper navigationState entry ({key, title}) — map it
        // back to the navigator route for name/params.
        const fullRoute = state.routes.find((r) => r.key === route.key);
        if (fullRoute) {
          navigation.navigate(fullRoute.name, fullRoute.params);
        }
      }}
      renderIcon={({ route, focused, color }) =>
        descriptors[route.key]?.options.tabBarIcon?.({ focused, color, size: 24 }) ?? null
      }
      getLabelText={({ route }) => descriptors[route.key]?.options.title ?? route.key}
      getTestID={({ route }) => descriptors[route.key]?.options.tabBarButtonTestID}
    />
  );
}
