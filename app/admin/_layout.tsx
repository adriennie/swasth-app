import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { hiddenTab } from '@/constants/navigation';
import { Platform } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function AdminLayout() {
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
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: Palette.lavenderText,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: {
          fontFamily: Fonts.body.semiBold,
          fontSize: 11,
        },
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
        name="distributors"
        options={{
          title: 'Distributors',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="truck" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="pharmacies"
        options={{
          title: 'Pharmacies',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="home" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="shopping-bag" size={focused ? 24 : 22} color={color as string} />
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

      {/* Hidden screens - accessible but not in tab bar */}
      <Tabs.Screen
        name="management"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/distributors"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/pharmacies"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/products"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/orders"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/mapping"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/ml-test"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="management/ml-test 2"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="about"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="contact-support"
        options={hiddenTab}
      />
      <Tabs.Screen
        name="privacy-policy"
        options={hiddenTab}
      />
    </Tabs>
  );
}
