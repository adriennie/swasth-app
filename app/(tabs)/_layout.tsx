import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function TabLayout() {
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
        tabBarActiveTintColor: Palette.lavender,
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontFamily: Fonts.body.semiBold,
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="shopping-bag" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="book-open" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="calendar" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="flowbot"
        options={{
          title: 'FlowBot',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="message-circle" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Feather name="user" size={focused ? 24 : 22} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}