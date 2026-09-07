import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
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
  );
}
