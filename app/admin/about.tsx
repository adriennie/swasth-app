import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TeamMember {
  name: string;
  role: string;
  responsibilities: string[];
}

const teamMembers: TeamMember[] = [
  {
    name: 'Vansh Raj Chauhan',
    role: 'Backend & Software Developer',
    responsibilities: ['API Development', 'System Architecture', 'Database Optimization'],
  },
  {
    name: 'Adrika Pradhan',
    role: 'Database Architect & ML Researcher',
    responsibilities: ['Database Design', 'App Debugging', 'ML Model Research'],
  },
  {
    name: 'Dhruv Bhattacharya',
    role: 'Frontend Builder & ML Engineer',
    responsibilities: ['UI Implementation', 'Frontend Development', 'ML Integration'],
  },
  {
    name: 'Rahul Verma',
    role: 'Frontend Designer & ML Engineer',
    responsibilities: ['UI/UX Design', 'Design System', 'ML Engineering'],
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Swasthya</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            Swasthya is a mobile-first pharmacy supply chain platform designed to streamline inventory management, procurement, and distributor coordination for Indian pharmacies.
          </Text>
          <Text style={styles.sectionText}>
            We empower pharmacies with offline-first capabilities, AI-driven demand forecasting, and intelligent anomaly detection to optimize operations and reduce stockouts.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Intelligent Pharmacy Network</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Offline-First Capabilities</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>AI-Driven Demand Forecasting</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Anomaly Detection</Text>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Real-Time Inventory Sync</Text>
            </View>
          </View>
        </View>

        {/* Team Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meet Our Team</Text>
          {teamMembers.map((member, idx) => (
            <View key={idx} style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                </View>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamRole}>{member.role}</Text>
                </View>
              </View>
              <View style={styles.teamResponsibilities}>
                {member.responsibilities.map((resp, ridx) => (
                  <View key={ridx} style={styles.respItem}>
                    <View style={styles.respDot} />
                    <Text style={styles.respText}>{resp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Version Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Version</Text>
          <Text style={styles.versionText}>Swasthya v1.0.0</Text>
          <Text style={styles.versionSubtext}>© 2025 Swasthya. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827', flex: 1, textAlign: 'center' },
  spacer: { width: 38 },
  scroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 24, paddingBottom: 40 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  sectionText: { fontSize: 15, color: '#374151', lineHeight: 22 },
  featureList: { gap: 10 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: { fontSize: 14, color: '#374151', flex: 1 },
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  teamHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  teamRole: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  teamResponsibilities: { gap: 6 },
  respItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  respDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#3B82F6' },
  respText: { fontSize: 13, color: '#6B7280' },
  versionText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  versionSubtext: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
