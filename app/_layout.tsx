import { Palette } from '@/constants/Colors';
import { FontAssets, Fonts } from '@/constants/Fonts';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/context/ProtectedRoute';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: unknown) {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error('Root error boundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function LoadingGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <>{children}</>;
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // On a font load error, render with system fonts rather than blocking the app.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ErrorBoundary>
        <LoadingGate>
          {/** Let Expo Router auto-register routes from the filesystem */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { paddingTop: 10, backgroundColor: Palette.canvas },
            }}
          />
          {/** Keep the guard close to the navigator but mount it only after loading */}
          <ProtectedRoute />
        </LoadingGate>
      </ErrorBoundary>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: Fonts.body.regular,
    fontSize: 16,
  },
});
