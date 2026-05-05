import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ContactSupportScreen() {
  const router = useRouter();

  const contactMethods = [
    {
      icon: 'mail',
      title: 'Email',
      description: 'support@swasthya.app',
      action: () => {
        Linking.openURL('mailto:adrika2607@gmail.com').catch(() => {
          Alert.alert('Error', 'Unable to open email client');
        });
      },
    },
    {
      icon: 'phone',
      title: 'Phone',
      description: '+91 (77) 3716-5550',
      action: () => {
        Alert.alert('Phone Support', 'Our team is available 9 AM - 6 PM IST');
      },
    },
  ];

  const faqs = [
    {
      q: 'How do I reset my password?',
      a: 'You can reset your password from the login screen by tapping "Forgot Password?" and following the instructions sent to your email.',
    },
    {
      q: 'Is my data secure?',
      a: 'Yes, all data is encrypted end-to-end and stored securely on our servers. We comply with all data protection regulations.',
    },
    {
      q: 'How do I update my profile?',
      a: 'Go to Settings → Profile to update your business information, contact details, and preferences.',
    },
    {
      q: 'What should I do if I encounter a bug?',
      a: 'Please report bugs through the Support section in Settings. Include details about what happened and any error messages you saw.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact & Support</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Contact Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          {contactMethods.map((method, idx) => (
            <TouchableOpacity key={idx} style={styles.contactCard} onPress={method.action}>
              <View style={styles.contactIcon}>
                <Feather name={method.icon as any} size={24} color="#3B82F6" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>{method.title}</Text>
                <Text style={styles.contactDesc}>{method.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Response Time */}
        <View style={styles.infoBox}>
          <Feather name="clock" size={20} color="#059669" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Response Time</Text>
            <Text style={styles.infoDesc}>We typically respond to support requests within 24 hours</Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq, idx) => (
            <View key={idx} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.q}</Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
        </View>

        {/* Community */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.communityCard}>
            <Feather name="users" size={24} color="#7C3AED" />
            <View style={styles.communityContent}>
              <Text style={styles.communityTitle}>Join Our Community</Text>
              <Text style={styles.communityDesc}>Connect with other pharmacy owners and learn best practices</Text>
            </View>
            <Feather name="arrow-right" size={20} color="#9CA3AF" />
          </View>
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
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactContent: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  contactDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  infoBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBFAF0',
  },
  infoContent: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#065F46' },
  infoDesc: { fontSize: 13, color: '#047857', marginTop: 2 },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqQuestion: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 8 },
  faqAnswer: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  communityContent: { flex: 1 },
  communityTitle: { fontSize: 15, fontWeight: '700', color: '#111827' },
  communityDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});
