import { FadeIn, Shadow, Tones, type Tone } from '@/components/ui/kit';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Each card pairs a supply problem pharmacies face with how Swasthya addresses it.
const solutions: { icon: React.ComponentProps<typeof Feather>['name']; tone: Tone; problem: string; solution: string }[] = [
  {
    icon: 'trending-up',
    tone: 'teal',
    problem: 'Stockouts',
    solution: 'Demand forecasts flag what will run out before the next delivery.',
  },
  {
    icon: 'calendar',
    tone: 'amber',
    problem: 'Expiry losses',
    solution: 'Batch and expiry tracking surfaces near-expiry stock early.',
  },
  {
    icon: 'repeat',
    tone: 'lavender',
    problem: 'Manual reordering',
    solution: 'Suggested reorders go straight to your mapped distributor.',
  },
];

const roles = [
  { icon: 'home', label: 'Pharmacies' },
  { icon: 'truck', label: 'Distributors' },
  { icon: 'shield', label: 'Admins' },
] as const;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Palette.ink, Palette.lavenderDeep, Palette.lavenderText]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.brandRow}>
            <View style={styles.logoWrap}>
              <Image source={require('../../assets/images/splash-icon.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <View>
              <Text style={styles.brand}>Swasthya</Text>
              <Text style={styles.brandTag}>Pharmacy supply network</Text>
            </View>
          </View>

          <Text style={styles.headline}>Keep every shelf stocked with the medicines your community needs.</Text>
          <Text style={styles.lede}>
            Swasthya connects pharmacies, distributors and admins so stock is forecast, reordered and delivered before
            it runs out.
          </Text>

          <View style={styles.roleRow}>
            {roles.map((r) => (
              <View key={r.label} style={styles.rolePill}>
                <Feather name={r.icon} size={13} color="#fff" />
                <Text style={styles.rolePillText}>{r.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <Text style={styles.sectionLabel}>What Swasthya fixes</Text>
          {solutions.map((s, i) => {
            const t = Tones[s.tone];
            return (
              <FadeIn key={s.problem} index={i}>
                <View style={styles.solutionCard}>
                  <View style={[styles.solutionIcon, { backgroundColor: t.bg }]}>
                    <Feather name={s.icon} size={18} color={t.fg} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.problem, { color: t.fg }]}>{s.problem}</Text>
                    <Text style={styles.solution}>{s.solution}</Text>
                  </View>
                </View>
              </FadeIn>
            );
          })}

          <FadeIn index={3}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.primaryButton, pressed && { opacity: 0.9 }]}
              onPress={() => router.push('/(auth)/supplier-login')}
            >
              <Feather name="log-in" size={18} color="#fff" />
              <Text style={styles.primaryText}>Sign in to your workspace</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.85 }]}
              onPress={() => router.push('/(auth)/supplier-signup')}
            >
              <Feather name="briefcase" size={18} color={Palette.lavenderText} />
              <Text style={styles.secondaryText}>Register a pharmacy or distributor</Text>
            </Pressable>

            <Pressable accessibilityRole="link" style={styles.linkRow} onPress={() => router.push('/(auth)/about-us')}>
              <Text style={styles.linkText}>About Swasthya</Text>
            </Pressable>
          </FadeIn>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.canvas },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: { width: 52, height: 52 },
  brand: { fontFamily: Fonts.heading.extraBold, fontSize: 22, color: '#fff' },
  brandTag: { fontFamily: Fonts.label.medium, fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  headline: {
    fontFamily: Fonts.heading.extraBold,
    fontSize: 28,
    lineHeight: 36,
    color: '#fff',
    marginTop: 36,
  },
  lede: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 12,
  },
  roleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 22 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  rolePillText: { fontFamily: Fonts.label.semiBold, fontSize: 12, color: '#fff' },
  body: { paddingHorizontal: 20, paddingTop: 24, gap: 10 },
  sectionLabel: {
    fontFamily: Fonts.label.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#64748B',
    marginBottom: 2,
  },
  solutionCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    ...Shadow,
  },
  solutionIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  problem: { fontFamily: Fonts.heading.bold, fontSize: 14 },
  solution: { fontFamily: Fonts.body.regular, fontSize: 13, lineHeight: 19, color: '#475569', marginTop: 2 },
  primaryButton: {
    marginTop: 14,
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: Palette.lavenderText,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryText: { fontFamily: Fonts.body.bold, fontSize: 16, color: '#fff' },
  secondaryButton: {
    marginTop: 10,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Palette.lavenderBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  secondaryText: { fontFamily: Fonts.body.semiBold, fontSize: 15, color: Palette.lavenderText },
  linkRow: { alignItems: 'center', paddingVertical: 14 },
  linkText: { fontFamily: Fonts.body.semiBold, fontSize: 13, color: '#64748B' },
});
