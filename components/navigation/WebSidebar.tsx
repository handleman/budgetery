import * as React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { usePathname, useRouter } from 'expo-router';

type Item = {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: string;
};

const ITEMS: Item[] = [
  { key: 'home', label: 'Home', icon: 'home', route: '/' },
  { key: 'income', label: 'Income', icon: 'wallet', route: '/tabs' },
  { key: 'obligations', label: 'Obligations', icon: 'alert-circle', route: '/tabs/obligations' },
  { key: 'expenses', label: 'Expenses', icon: 'basket', route: '/tabs/expenses' },
  { key: 'track', label: 'Track', icon: 'swap-horizontal', route: '/' },
  { key: 'settings', label: 'Settings', icon: 'cog', route: '/config' },
];

/**
 * WebSidebar — wide-screen navigation rail (redesign P5, ≥1024px web).
 * Bottom tabs stay for narrow screens. Track maps to welcome (start a new
 * month there); no new route. Active = current pathname, pill highlight.
 */
export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  // Mockup active pill: light green tint (both color schemes mapped).
  const activeBg = colorScheme === 'dark' ? '#1E4D2B' : '#DFF3E4';
  const activeFg = colorScheme === 'dark' ? '#7ED957' : '#0E863D';
  return (
    <View testID="web-sidebar" style={[styles.rail, { backgroundColor: theme.colors.surface }]}>
      <Text variant="titleLarge" style={styles.brand}>
        Budgetery
      </Text>
      {ITEMS.map((item) => {
        const active = item.key === 'track' ? false : pathname === item.route;
        return (
          <Pressable
            key={item.key}
            onPress={() => router.push(item.route as never)}
            testID={`sidebar-nav-${item.key}`}
            style={[styles.row, active && { backgroundColor: activeBg }]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={active ? activeFg : theme.colors.onSurfaceVariant}
            />
            <Text style={[styles.label, active && { color: activeFg, fontWeight: 'bold' }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 240,
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 4,
  },
  brand: {
    paddingHorizontal: 12,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
  },
});
