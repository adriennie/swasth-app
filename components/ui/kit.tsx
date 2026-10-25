// Shared building blocks for the operations screens (pharmacy, distributor,
// admin). See docs/ui_design_system.md for the design rules they follow.
import { Palette, Radii } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Feather>['name'];

// Semantic color pairs: tinted background + readable foreground.
export const Tones = {
  lavender: { bg: Palette.lavenderSoft, fg: Palette.lavenderText },
  teal: { bg: Palette.tealSoft, fg: Palette.tealText },
  amber: { bg: '#FEF3C7', fg: '#B45309' },
  rose: { bg: '#FDE8EE', fg: '#B4234A' },
  slate: { bg: '#F1F5F9', fg: '#475569' },
} as const;
export type Tone = keyof typeof Tones;

export const Shadow = {
  shadowColor: Palette.ink,
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;

// Staggered entrance after data loads. Respects the system reduced-motion setting.
export function FadeIn({ index = 0, children, style }: { index?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 10) * 60).duration(360).reduceMotion(ReduceMotion.System)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

export function HeroHeader({
  eyebrow,
  title,
  subtitle,
  right,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={[Palette.ink, Palette.lavenderDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insets.top + 16 }]}
    >
      <View style={styles.heroRow}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={styles.heroEyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.heroTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      {children}
    </LinearGradient>
  );
}

export function HeroIconButton({ icon, onPress, label }: { icon: IconName; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.heroIconButton}>
      <Feather name={icon} size={18} color="#fff" />
    </Pressable>
  );
}

export function StatTile({
  icon,
  value,
  label,
  tone = 'lavender',
  hint,
  style,
}: {
  icon: IconName;
  value: string | number;
  label: string;
  tone?: Tone;
  hint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const t = Tones[tone];
  return (
    <View style={[styles.stat, style]}>
      <View style={[styles.statIcon, { backgroundColor: t.bg }]}>
        <Feather name={icon} size={18} color={t.fg} />
      </View>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
      {hint ? <Text style={[styles.statHint, { color: t.fg }]}>{hint}</Text> : null}
    </View>
  );
}

export function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.section}>
      <View style={{ flex: 1 }}>
        <View style={styles.sectionTitleRow}>
          {icon ? <Feather name={icon} size={16} color={Palette.lavenderText} /> : null}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
          <Text style={styles.sectionAction}>{action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, tone = 'slate' }: { label: string; tone?: Tone }) {
  const t = Tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.badgeText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress, count }: { label: string; active?: boolean; onPress: () => void; count?: number }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
      {count !== undefined ? <Text style={[styles.chipCount, active && styles.chipTextActive]}>{count}</Text> : null}
    </Pressable>
  );
}

export function ActionTile({
  icon,
  title,
  subtitle,
  tone = 'lavender',
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  tone?: Tone;
  onPress: () => void;
}) {
  const t = Tones[tone];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.action, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: t.bg }]}>
        <Feather name={icon} size={18} color={t.fg} />
      </View>
      <Text style={styles.actionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.actionSubtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroEyebrow: {
    fontFamily: Fonts.label.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.62)',
    marginBottom: 4,
  },
  heroTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 24, color: '#fff' },
  heroSubtitle: { fontFamily: Fonts.body.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  heroIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stat: {
    backgroundColor: '#fff',
    borderRadius: Radii.operational,
    padding: 14,
    ...Shadow,
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontFamily: Fonts.label.bold, fontSize: 22, color: Palette.ink },
  statLabel: { fontFamily: Fonts.label.medium, fontSize: 12, color: '#64748B', marginTop: 2 },
  statHint: { fontFamily: Fonts.label.semiBold, fontSize: 11, marginTop: 6 },
  section: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 24, marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontFamily: Fonts.heading.bold, fontSize: 17, color: Palette.ink },
  sectionSubtitle: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#64748B', marginTop: 2 },
  sectionAction: { fontFamily: Fonts.body.semiBold, fontSize: 13, color: Palette.lavenderText },
  card: { backgroundColor: '#fff', borderRadius: Radii.operational, padding: 14, ...Shadow },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontFamily: Fonts.label.bold, fontSize: 10, letterSpacing: 0.3 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E7E3F1',
  },
  chipActive: { backgroundColor: Palette.lavenderText, borderColor: Palette.lavenderText },
  chipText: { fontFamily: Fonts.body.semiBold, fontSize: 13, color: Palette.ink },
  chipTextActive: { color: '#fff' },
  chipCount: { fontFamily: Fonts.label.medium, fontSize: 11, color: '#64748B' },
  action: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: Radii.operational,
    padding: 14,
    ...Shadow,
  },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionTitle: { fontFamily: Fonts.heading.bold, fontSize: 14, color: Palette.ink },
  actionSubtitle: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#64748B', marginTop: 2 },
});
