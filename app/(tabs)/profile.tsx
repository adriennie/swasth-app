import { useAuth } from '@/context/AuthContext';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  const menuItems = [
    { id: 'orders', title: 'My Orders', icon: 'package' },
    { id: 'wishlist', title: 'My Wishlist', icon: 'heart' },
    { id: 'address', title: 'My Addresses', icon: 'map-pin' },
    { id: 'payment', title: 'Payment Methods', icon: 'credit-card' },
    { id: 'settings', title: 'Settings', icon: 'settings' },
    { id: 'support', title: 'Help & Support', icon: 'help-circle' },
  ];

  const QuickActions = () => (
    <View style={styles.quickActionsSection}>
      <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(tabs)/')}>
        <Feather name="shopping-bag" size={24} color="#3B82F6" />
        <Text style={styles.quickActionButtonText}>Shop</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(tabs)/tracker')}>
        <Feather name="calendar" size={24} color="#10B981" />
        <Text style={styles.quickActionButtonText}>Tracker</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(tabs)/learn')}>
        <Feather name="book-open" size={24} color="#F97316" />
        <Text style={styles.quickActionButtonText}>Learn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#1D4ED8']} style={styles.header}>
        <View style={styles.avatar}>
          <Feather name="user" size={40} color="#fff" />
        </View>
        <Text style={styles.profileName}>{auth?.email || 'Customer'}</Text>
        <Text style={styles.profileRole}>Customer Account</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <QuickActions />
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.id} style={styles.menuItem}>
              <Feather name={item.icon as any} size={22} color="#4B5563" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Feather name="chevron-right" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  quickActionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  quickActionButton: {
    alignItems: 'center',
  },
  quickActionButtonText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    marginTop: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
}); 