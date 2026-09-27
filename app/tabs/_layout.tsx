import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { PaperTabBar } from '@/components/navigation/PaperTabBar';
import { WebSidebar } from '@/components/navigation/WebSidebar';
import { shouldShowSidebar } from '@/components/navigation/sidebar';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const wide = shouldShowSidebar(Platform.OS, width);
  return (
    <View style={wide ? styles.wide : styles.narrow}>
      {wide ? <WebSidebar /> : null}
      <View style={styles.content}>
        <Tabs
          tabBar={wide ? () => null : (props) => <PaperTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Income',
          tabBarButtonTestID: 'tab-income',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="obligations"
        options={{
          title: 'Obligations',
          tabBarButtonTestID: 'tab-obligations',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'alert-circle' : 'alert-circle-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarButtonTestID: 'tab-expenses',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'basket' : 'basket-outline'} color={color} />
          ),
        }}
      />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  narrow: {
    flex: 1,
  },
  wide: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
});
