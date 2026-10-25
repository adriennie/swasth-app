import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { Shadow } from '@/components/ui/kit';

type Role = 'admin' | 'distributor' | 'pharmacy';

export default function SupplierLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('pharmacy');
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const handleSupplierLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (authError) {
        Alert.alert('Login Failed', authError.message);
        return;
      }

      const user = authData.user;
      let profileData = null;
      let profileError = null;

      // 2. Check the specific profile table based on role
      if (role === 'distributor') {
        const { data, error } = await supabase
          .from('distributor_profiles')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .single();
        profileData = data;
        profileError = error;
      } else if (role === 'pharmacy') {
        const { data, error } = await supabase
          .from('pharmacy_profiles')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .single();
        profileData = data;
        profileError = error;
      } else if (role === 'admin') {
        // For admin, we might still use metadata or a specific admin table if it exists
        // Assuming admin@hercircle.com is the only admin for now as per previous logic
        // For admin, we might still use metadata or a specific admin table if it exists
        // Assuming admin@hercircle.com is the only admin for now as per previous logic
        if (email.trim().toLowerCase() === 'admin@hercircle.com') {
          login({ id: user.id, email: user.email!, role: 'admin', loggedInAt: Date.now() });
          return;
        }
      }

      if (profileError || !profileData) {
        Alert.alert('Access Denied', `No ${role} profile found for this account.`);
        return;
      }

      // 3. Check approval status from the profile table
      if (profileData.status !== 'approved') {
        Alert.alert('Pending Approval', 'Your account is pending admin approval.');
        return;
      }

      login({
        id: user.id,
        email: user.email!,
        role: role,
        loggedInAt: Date.now(),
      });

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An unexpected error occurred while logging in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Palette.ink, Palette.lavenderDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}>
            <Feather name="chevron-left" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Swasthya workspace.</Text>
        </LinearGradient>

        <View style={styles.form}>
          <Text style={styles.label}>I am signing in as</Text>
          <View style={styles.roles}>
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <Pressable
                  key={r.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  onPress={() => setRole(r.id)}
                  style={[styles.role, active && styles.roleActive]}
                >
                  <View style={[styles.roleIcon, active && styles.roleIconActive]}>
                    <Feather name={r.icon} size={16} color={active ? '#fff' : Palette.lavenderText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleName}>{r.name}</Text>
                    <Text style={styles.roleDesc}>{r.description}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>{active ? <View style={styles.radioDot} /> : null}</View>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Email</Text>
          <View style={styles.input}>
            <Feather name="mail" size={18} color="#64748B" />
            <TextInput
              style={styles.inputText}
              placeholder="you@business.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.input}>
            <Feather name="lock" size={18} color="#64748B" />
            <TextInput
              style={styles.inputText}
              placeholder="Your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              accessibilityLabel="Password"
              onSubmitEditing={handleSupplierLogin}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={8}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#64748B" />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={handleSupplierLogin}
            style={({ pressed }) => [styles.primary, (pressed || submitting) && { opacity: 0.85 }]}
          >
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Sign in</Text>}
          </Pressable>

          <Pressable accessibilityRole="link" style={styles.link} onPress={() => router.push('/(auth)/supplier-signup')}>
            <Text style={styles.linkText}>
              New to Swasthya? <Text style={styles.linkStrong}>Register your business</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ROLES: { id: Role; name: string; description: string; icon: React.ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'pharmacy', name: 'Pharmacy', description: 'Inventory, reorders and incoming deliveries', icon: 'home' },
  { id: 'distributor', name: 'Distributor', description: 'Pharmacy orders, fulfilment and stock', icon: 'truck' },
  { id: 'admin', name: 'Admin', description: 'Approvals, mappings and network health', icon: 'shield' },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.canvas },
  hero: {
    paddingHorizontal: 22,
    paddingBottom: 56,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: Fonts.heading.extraBold, fontSize: 28, color: '#fff' },
  subtitle: { fontFamily: Fonts.body.regular, fontSize: 14, color: 'rgba(255,255,255,0.78)', marginTop: 6 },
  form: {
    marginHorizontal: 16,
    marginTop: -36,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    ...Shadow,
  },
  label: { fontFamily: Fonts.label.semiBold, fontSize: 13, color: Palette.ink, marginBottom: 8, marginTop: 6 },
  roles: { gap: 8, marginBottom: 12 },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E3F1',
    backgroundColor: '#fff',
  },
  roleActive: { borderColor: Palette.lavenderText, backgroundColor: Palette.lavenderSoft },
  roleIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Palette.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconActive: { backgroundColor: Palette.lavenderText },
  roleName: { fontFamily: Fonts.heading.bold, fontSize: 14, color: Palette.ink },
  roleDesc: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#64748B', marginTop: 1 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: Palette.lavenderText },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Palette.lavenderText },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7E3F1',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputText: { fontFamily: Fonts.body.regular, flex: 1, height: 50, fontSize: 15, color: Palette.ink },
  primary: {
    marginTop: 8,
    height: 52,
    borderRadius: 14,
    backgroundColor: Palette.lavenderText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { fontFamily: Fonts.body.bold, fontSize: 16, color: '#fff' },
  link: { alignItems: 'center', paddingTop: 16, paddingBottom: 4 },
  linkText: { fontFamily: Fonts.body.regular, fontSize: 13, color: '#64748B' },
  linkStrong: { fontFamily: Fonts.body.semiBold, color: Palette.lavenderText },
});
