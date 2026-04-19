import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';

export default function Index() {
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
  }, []);

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (status === 'tabs') {
    // Use a declarative Redirect to the tabs group so Expo Router can resolve it correctly
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/signup" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
