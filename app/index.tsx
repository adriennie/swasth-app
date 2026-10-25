import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [status, setStatus] = useState<'loading' | 'tabs' | 'onboarding'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const completed = await AsyncStorage.getItem('onboardingCompleted');
        setStatus(completed === 'true' ? 'tabs' : 'onboarding');
      } catch {
        setStatus('onboarding');
      }
    })();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[Palette.tealText, Palette.tealDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}>
          <View style={styles.content}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../assets/images/splash-icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Swasthya</Text>
            <Text style={styles.subtitle}>Intelligent Pharmacy Network</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (status === 'tabs') {
    // Use a declarative Redirect to the tabs group so Expo Router can resolve it correctly
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/health-quiz" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.tealText,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 46,
    height: 46,
  },
  title: {
    fontFamily: Fonts.heading.extraBold,
    fontSize: 34,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.body.regular,
    marginTop: 6,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});
