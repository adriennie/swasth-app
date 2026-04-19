import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function ProtectedRoute() {
  const { auth, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!auth && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (auth) {
      const roleDashboard = `/${auth.role}`;
      if (inAuthGroup) {
        router.replace(roleDashboard);
      } else if (segments[0] !== auth.role && segments[0] !== '(tabs)') {
        router.replace(roleDashboard);
      }
    }
  }, [auth, loading, segments]);

  return null;
}