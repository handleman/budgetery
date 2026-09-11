import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { PaperTabBar } from '@/components/navigation/PaperTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <PaperTabBar {...props} />}
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
  );
}
