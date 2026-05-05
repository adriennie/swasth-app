import { LinearGradient } from 'expo-linear-gradient';
import { Link, Stack, router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#06B6D4']} style={styles.gradient} />

        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Page Not Found</ThemedText>
          <ThemedText style={styles.subtitle}>We couldn`&apos;`t find the page you`&apos;`re looking for.</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardText}>This route doesn`&apos;` exist or may have been moved.</ThemedText>

          <View style={styles.buttonsRow}>
            <Link href="/" style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Go Home</Text>
            </Link>

            <TouchableOpacity style={styles.ghostButton} onPress={() => router.push('/(auth)/supplier-login')}>
              <Text style={styles.ghostButtonText}>Supplier Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '35%',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)'
  },
  card: {
    marginTop: 40,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 18,
  },
  buttonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  linkButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ghostButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButtonText: { color: '#059669', fontWeight: '700', fontSize: 16 },
});
