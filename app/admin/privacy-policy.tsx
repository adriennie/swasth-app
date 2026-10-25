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
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={Palette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Last updated: May 2025</Text>

        {/* Introduction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.bodyText}>
            Swasthya we operates the Swasthya mobile application the &#34;Service&#34;. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </Text>
        </View>

        {/* Data Collection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information Collection and Use</Text>
          <Text style={styles.subsectionTitle}>We collect several different types of information:</Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Personal Data: Name, email address, phone number, business information</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Usage Data: Pages visited, features used, time spent on the app</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Device Information: Device type, OS version, app version</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Location Data: With your permission, to provide location-based services</Text>
            </View>
          </View>
        </View>

        {/* Data Usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Use of Data</Text>
          <Text style={styles.bodyText}>
            Swasthya uses the collected data for various purposes:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>To provide and maintain our Service</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>To notify you about changes to our Service</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>To allow you to participate in interactive features</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>To provide customer support</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>To gather analysis or valuable information for improving the Service</Text>
            </View>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Security of Data</Text>
          <Text style={styles.bodyText}>
            The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </Text>
        </View>

        {/* Third Party Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
          <Text style={styles.bodyText}>
            Our Service may contain links to other sites that are not operated by us. This Privacy Policy does not apply to third-party websites, and we are not responsible for their content or privacy practices.
          </Text>
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.bodyText}>
            We will retain your Personal Data only for as long as necessary for the purposes set out in this Privacy Policy. We will retain and use your Personal Data to the extent necessary to comply with our legal obligations.
          </Text>
        </View>

        {/* Your Rights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Your Rights</Text>
          <Text style={styles.bodyText}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Access your personal data</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Correct inaccurate data</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Request deletion of your data</Text>
            </View>
            <View style={styles.bulletItem}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>Opt-out of certain communications</Text>
            </View>
          </View>
        </View>

        {/* Changes to Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Privacy Policy</Text>
          <Text style={styles.bodyText}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &#34;effective date&#34; at the top of this Privacy Policy.
          </Text>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.bodyText}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email:</Text>
            <Text style={styles.contactValue}>privacy@swasthya.app</Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
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
    backgroundColor: Palette.canvas,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 18, color: Palette.ink, flex: 1, textAlign: 'center' },
  spacer: { width: 38 },
  scroll: { paddingHorizontal: 16, paddingVertical: 16, gap: 16, paddingBottom: 40 },
  lastUpdated: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  section: { gap: 10 },
  sectionTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 16, color: Palette.ink },
  subsectionTitle: { fontFamily: Fonts.heading.bold, fontSize: 14, color: '#374151' },
  bodyText: { fontFamily: Fonts.body.regular, fontSize: 14, color: '#374151', lineHeight: 21 },
  bulletList: { gap: 8, marginTop: 8 },
  bulletItem: { flexDirection: 'row', gap: 10 },
  bulletDot: { fontFamily: Fonts.body.bold, fontSize: 14, color: '#6B7280' },
  bulletText: { fontFamily: Fonts.body.regular, fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  contactInfo: { marginTop: 10, gap: 6 },
  contactLabel: { fontFamily: Fonts.body.bold, fontSize: 13, color: Palette.ink },
  contactValue: { fontFamily: Fonts.label.regular, fontSize: 13, color: Palette.teal },
});
