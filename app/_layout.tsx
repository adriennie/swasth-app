import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/context/ProtectedRoute';

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

export default function RootLayout(): JSX.Element {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <LoadingGate>
          {/** Let Expo Router auto-register routes from the filesystem */}
          <Stack screenOptions={{ headerShown: false }} />
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
    fontSize: 16,
  },
});
