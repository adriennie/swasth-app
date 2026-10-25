import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function PharmacyIndex() {
  const { auth, loading } = useAuth();

  useEffect(() => {
    if (!loading && auth?.role === 'pharmacy') {
      router.replace('/pharmacy/dashboard');
    }
  }, [auth, loading]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Palette.lavenderText} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Palette.lavenderText, Palette.teal]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <View style={styles.logoCircle}>
            <Ionicons name="medkit" size={28} color={Palette.lavenderText} />
          </View>
          <Text style={styles.title}>Pharmacy Management</Text>
          <Text style={styles.subtitle}>List your store, manage inventory, and fulfill orders</Text>
        </View>
      </LinearGradient>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(auth)/supplier-login')}>
          <LinearGradient colors={[Palette.lavenderText, Palette.teal]} style={styles.primaryGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.primaryText}>Sign In</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/(auth)/supplier-signup')}>
          <Ionicons name="storefront" size={18} color={Palette.ink} />
          <Text style={styles.secondaryText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: Palette.lavenderSoft }]}>
            <Ionicons name="cube" size={18} color={Palette.lavenderText} />
          </View>
          <Text style={styles.featureTitle}>Inventory</Text>
          <Text style={styles.featureDesc}>Add, edit, and track stock with low-stock alerts.</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: Palette.tealSoft }]}>
            <Ionicons name="bag-check" size={18} color={Palette.teal} />
          </View>
          <Text style={styles.featureTitle}>Orders</Text>
          <Text style={styles.featureDesc}>Manage order statuses from Pending to Completed.</Text>
        </View>
        <View style={styles.featureCard}>
          <View style={[styles.featureIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="settings" size={18} color="#22C55E" />
          </View>
          <Text style={styles.featureTitle}>Settings</Text>
          <Text style={styles.featureDesc}>Control store listing, hours, and delivery radius.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  container: { flex: 1, backgroundColor: Palette.canvas },
  header: { paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { alignItems: 'center' },
  logoCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  title: { fontFamily: Fonts.heading.extraBold, fontSize: 26, color: '#fff' },
  subtitle: { marginTop: 6, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  actions: { padding: 20, gap: 12 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden' },
  primaryGrad: { height: 54, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  primaryText: { fontFamily: Fonts.body.extraBold, color: '#fff', fontSize: 16 },
  secondaryBtn: { height: 54, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  secondaryText: { fontFamily: Fonts.body.extraBold, color: Palette.ink, fontSize: 16 },
  features: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, gap: 12 },
  featureCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 15, color: Palette.ink, marginBottom: 4 },
  featureDesc: { fontFamily: Fonts.body.regular, fontSize: 13, color: '#64748B' },
});