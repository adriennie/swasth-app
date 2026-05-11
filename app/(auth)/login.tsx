import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const highlights = [
  { icon: 'activity', label: 'Forecasting' },
  { icon: 'package', label: 'Inventory' },
  { icon: 'truck', label: 'Orders' },
] as const;

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/images/splash-icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>B2B App</Text>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.appName}>Swasthya</Text>
            <Text style={styles.headline}>A calmer way to run pharmacy operations.</Text>
            <Text style={styles.description}>
              Precision inventory, reorder intelligence, and B2B fulfillment in one refined workspace.
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.main}>
          <View style={styles.highlightsRow}>
            {highlights.map((item) => (
              <BlurView key={item.label} intensity={38} tint="light" style={styles.highlightCard}>
                <View style={styles.highlightIcon}>
                  <Feather name={item.icon} size={18} color="#059669" />
                </View>
                <Text style={styles.highlightLabel}>{item.label}</Text>
              </BlurView>
            ))}
          </View>

          <BlurView intensity={42} tint="light" style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Enter Swasthya</Text>
            <Text style={styles.sectionSubtitle}>Admin, pharmacy, and distributor access.</Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/supplier-login')}
            >
              <View style={styles.buttonIcon}>
                <Feather name="log-in" size={18} color="#fff" />
              </View>
              <View style={styles.buttonTextWrap}>
                <Text style={styles.primaryButtonText}>Sign in</Text>
                <Text style={styles.primaryButtonSubtext}>Continue to your dashboard</Text>
              </View>
              <Feather name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/supplier-signup')}
            >
              <View style={styles.secondaryIcon}>
                <Feather name="briefcase" size={18} color="#059669" />
              </View>
              <View style={styles.buttonTextWrap}>
                <Text style={styles.secondaryButtonText}>Create supplier account</Text>
                <Text style={styles.secondaryButtonSubtext}>Pharmacy or distributor profile</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#059669" />
            </TouchableOpacity>
          </BlurView>

          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.customerLink}
            onPress={() => router.push('/(auth)/about-us')}
          >
            <Feather name="heart" size={16} color="#059669" />
            <Text style={styles.customerText}>About Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 26,
  },
  hero: {
    minHeight: 470,
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 28,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoWrap: {
    width: 98,
    height: 98,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245,245,244,0.20)',
  },
  logoImage: {
    width: 98,
    height: 98,
    borderRadius: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245,245,244,0.18)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroCopy: {
    marginTop: 44,
  },
  appName: {
    fontSize: 44,
    fontWeight: '800',
    color: '#fff',
  },
  headline: {
    marginTop: 8,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    color: '#F5F5F4',
  },
  description: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(245,245,244,0.78)',
  },
  signalPanel: {
    marginTop: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(245,245,244,0.24)',
  },
  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  signalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F5F5F4',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalMetric: {
    flex: 1,
  },
  signalValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  signalLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(245,245,244,0.62)',
  },
  signalDivider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(245,245,244,0.18)',
    marginHorizontal: 16,
  },
  main: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  highlightsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  highlightCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 16,
    padding: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.78)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  highlightIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(209,250,229,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: '#064E3B',
  },
  actionSection: {
    backgroundColor: 'rgba(255,255,255,0.66)',
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.82)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#064E3B',
  },
  sectionSubtitle: {
    marginTop: 5,
    marginBottom: 16,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
  primaryButton: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  buttonIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextWrap: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButtonSubtext: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(236,253,245,0.82)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  secondaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(209,250,229,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButtonSubtext: {
    marginTop: 2,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  customerLink: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  customerText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
});
