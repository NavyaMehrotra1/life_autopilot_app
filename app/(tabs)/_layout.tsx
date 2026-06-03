import React from 'react';
import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/ui/TabBar';

/** Bottom tabs: home · fridge · meals · fitness · you. */
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'home' }} />
      <Tabs.Screen name="fridge" options={{ title: 'fridge' }} />
      <Tabs.Screen name="meals" options={{ title: 'meals' }} />
      <Tabs.Screen name="fitness" options={{ title: 'fitness' }} />
      <Tabs.Screen name="profile" options={{ title: 'you' }} />
    </Tabs>
  );
}
