import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { hiddenTab } from '@/constants/navigation';
import { Platform } from 'react-native';
import { Palette } from '@/constants/Colors';

export default function PharmacyLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          paddingTop: 10,
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: Palette.lavenderText,
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="box" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="list" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="settings" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="add-inventory"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          ...hiddenTab,
          tabBarStyle: { display: 'none' }, // Hide tab bar on cart screen if desired
        }}
      />
    </Tabs>
  );
}