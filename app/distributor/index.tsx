import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { ActionTile, Card, FadeIn, HeroHeader, HeroIconButton, SectionHeader, StatTile } from '@/components/ui/kit';

interface Pharmacy {
  id: string;
  business_legal_name?: string;
  trade_name?: string;
  contact_name?: string;
  email?: string;
  city?: string;
  state?: string;
  contact_mobile?: string;
}

export default function DistributorDashboard() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    stockCount: 0,
    pendingOrders: 0,
    totalSales: 0,
  });
  const [assignedPharmacies, setAssignedPharmacies] = useState<Pharmacy[]>([]);
  const [distributorId, setDistributorId] = useState<string | null>(null);

  // Modal State
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);

  const fetchStats = async () => {
    if (!auth?.id) return;
    try {
      // 1. Get Distributor Profile ID first
      const { data: profile } = await supabase
        .from('distributor_profiles')
        .select('id')
        .eq('user_id', auth.id)
        .single();

      const realDistId = profile?.id;
      setDistributorId(realDistId);

      if (!realDistId) return;

      // 2. Stock Count
      const { count: stockCount } = await supabase
        .from('distributor_stock')
        .select('*', { count: 'exact', head: true })
        .eq('distributor_id', auth.id);

      // 3. Pending Orders (from Pharmacies)
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('distributor_id', realDistId)
        .eq('status', 'pending');

      // 4. Total Sales (Completed Orders)
      const { data: salesData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('distributor_id', realDistId)
        .neq('status', 'cancelled');

      const totalSales = (salesData || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      setStats({
        stockCount: stockCount || 0,
        pendingOrders: pendingOrders || 0,
        totalSales: totalSales || 0,
      });

      // 5. Fetch Assigned Pharmacies
      const { data: pharmData } = await supabase
        .from('pharmacy_distributors')
        .select(`
          pharmacy:pharmacy_profiles (
            id,
            business_legal_name,
            trade_name,
            contact_name,
            email,
            city,
            state,
            contact_mobile
          )
        `)
        .eq('distributor_id', realDistId)
        .limit(5);

      const list = pharmData?.map((p: any) => p.pharmacy).filter(Boolean) || [];
      setAssignedPharmacies(list);

    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [auth])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <HeroHeader
        eyebrow="Distributor workspace"
        title="Fulfilment hub"
        subtitle={
          stats.pendingOrders > 0
            ? `${stats.pendingOrders} pharmacy ${stats.pendingOrders === 1 ? 'order is' : 'orders are'} waiting for you`
            : 'No pharmacy orders waiting'
        }
        right={<HeroIconButton icon="log-out" label="Sign out" onPress={logout} />}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.lavenderText} />}
      >
        <View style={styles.statsRow}>
          <FadeIn index={0} style={{ flex: 1 }}>
            <StatTile icon="clock" tone={stats.pendingOrders ? 'amber' : 'slate'} value={stats.pendingOrders} label="Pending orders" />
          </FadeIn>
          <FadeIn index={1} style={{ flex: 1 }}>
            <StatTile icon="package" tone="teal" value={stats.stockCount} label="SKUs in stock" />
          </FadeIn>
        </View>
        <FadeIn index={2}>
          <StatTile
            icon="trending-up"
            tone="lavender"
            value={`₹${stats.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            label="Order value from pharmacies (excludes cancelled)"
            style={{ marginTop: 12 }}
          />
        </FadeIn>

        <SectionHeader title="Quick actions" />
        <FadeIn index={3}>
          <View style={styles.actionsRow}>
            <ActionTile icon="clipboard" tone="amber" title="Orders" subtitle="From pharmacies" onPress={() => router.push('/distributor/orders')} />
            <ActionTile icon="book-open" tone="lavender" title="Catalogue" subtitle="Buy from admin" onPress={() => router.push('/distributor/catalogue')} />
          </View>
          <View style={[styles.actionsRow, { marginTop: 10 }]}>
            <ActionTile icon="shopping-cart" tone="teal" title="Cart" subtitle="Review purchase" onPress={() => router.push('/distributor/cart')} />
            <ActionTile icon="users" tone="slate" title="Pharmacies" subtitle="Your clients" onPress={() => router.push('/distributor/pharmacies')} />
          </View>
        </FadeIn>

        <SectionHeader
          icon="home"
          title="Assigned pharmacies"
          action={{ label: 'See all', onPress: () => router.push('/distributor/pharmacies') }}
        />

        {assignedPharmacies.length > 0 ? (
          <View style={{ gap: 10 }}>
            {assignedPharmacies.map((pharm, i) => (
              <FadeIn key={pharm.id} index={i + 4}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.pharmacyCard, pressed && { opacity: 0.85 }]}
                  onPress={() => setSelectedPharmacy(pharm)}
                >
                  <View style={styles.pharmacyIcon}>
                    <Feather name="home" size={18} color={Palette.lavenderText} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pharmacyName}>
                      {pharm.trade_name || pharm.business_legal_name || 'Unnamed Pharmacy'}
                    </Text>
                    <Text style={styles.pharmacyLoc}>{[pharm.city, pharm.state].filter(Boolean).join(', ')}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#94A3B8" />
                </Pressable>
              </FadeIn>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyState}>
            <Feather name="users" size={28} color="#CBD5E1" />
            <Text style={styles.emptyText}>No pharmacies assigned yet.</Text>
          </Card>
        )}
      </ScrollView>

      {/* Pharmacy Details Modal */}
      <Modal
        visible={!!selectedPharmacy}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPharmacy(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pharmacy Details</Text>
              <TouchableOpacity onPress={() => setSelectedPharmacy(null)}>
                <Feather name="x" size={24} color={Palette.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.detailContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trade Name</Text>
                <Text style={styles.detailValue}>{selectedPharmacy?.trade_name || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Business Name</Text>
                <Text style={styles.detailValue}>{selectedPharmacy?.business_legal_name || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact Person</Text>
                <Text style={styles.detailValue}>{selectedPharmacy?.contact_name || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedPharmacy?.email || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{selectedPharmacy?.contact_mobile || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {[selectedPharmacy?.city, selectedPharmacy?.state].filter(Boolean).join(', ') || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Palette.lavenderText }]}
                onPress={() => setSelectedPharmacy(null)}
              >
                <Feather name="phone" size={18} color="#fff" />
                <Text style={styles.actionText}>Call Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: Palette.lavenderSoft }]}
                onPress={() => setSelectedPharmacy(null)}
              >
                <Feather name="mail" size={18} color={Palette.lavenderText} />
                <Text style={[styles.actionText, { color: Palette.lavenderText }]}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.canvas },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 12 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  pharmacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    shadowColor: Palette.ink,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  pharmacyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Palette.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pharmacyName: { fontFamily: Fonts.heading.bold, fontSize: 15, color: Palette.ink },
  pharmacyLoc: { fontFamily: Fonts.body.regular, fontSize: 13, color: '#64748B', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyText: { fontFamily: Fonts.body.regular, color: '#64748B' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 20, color: Palette.ink },
  detailContainer: { gap: 16, marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  detailLabel: { fontFamily: Fonts.body.regular, fontSize: 14, color: '#6B7280', width: 120 },
  detailValue: { fontFamily: Fonts.label.semiBold, fontSize: 15, color: Palette.ink, flex: 1, textAlign: 'right' },
  modalActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  actionText: { fontFamily: Fonts.body.bold, color: '#fff', fontSize: 15 },
});
