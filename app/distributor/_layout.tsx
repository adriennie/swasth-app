import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { hiddenTab } from '@/constants/navigation';
import { Platform } from 'react-native';

export default function DistributorLayout() {
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
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="grid" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="package" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders-to-admin"
        options={{
          title: 'Admin Orders',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="shopping-cart" size={focused ? 24 : 22} color={color as string} />
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
        name="pharmacies"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="catalogue"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="add-stock"
        options={{
          ...hiddenTab,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          ...hiddenTab,
        }}
      />
    </Tabs>
  );
}
