// app/pharmacy/dashboard.tsx
// ✅ ML INTEGRATED — shows AI reorder suggestions below stats

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ForecastResult,
  getDemandForecast,
  getUrgencyColor,
} from '@/services/swasthyaML';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Stats {
  pendingOrders: number;
  lowStock: number;
  outOfStock: number;
  revenueToday: number;
}

interface Distributor {
  id: string;
  display_name?: string;
  contact_name?: string;
  email?: string;
  city?: string;
  state?: string;
  contact_mobile?: string;
}

// ─── NEW: ML Reorder Card ────────────────────────────────────────────────────
function ReorderCard({ item }: { item: ForecastResult & { product_name: string } }) {
  const color = getUrgencyColor(item.urgency);
  return (
    <View style={[mlStyles.reorderCard, { borderLeftColor: color }]}>
      <View style={{ flex: 1 }}>
        <Text style={mlStyles.productName}>{item.product_name}</Text>
        <Text style={[mlStyles.urgencyText, { color }]}>{item.urgency}</Text>
        <Text style={mlStyles.detailText}>
          Stock: {item.current_stock} units · Reorder: {item.reorder_qty} units
        </Text>
        <Text style={mlStyles.detailText}>
          Days left: ~{item.days_until_stockout} · 7-day demand: {item.forecast_7d} units
        </Text>
      </View>
      <View style={[mlStyles.badge, { backgroundColor: color + '20' }]}>
        <Text style={[mlStyles.badgeText, { color }]}>
          ₹{item.order_value.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

export default function PharmacyDashboard() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ pendingOrders: 0, lowStock: 0, outOfStock: 0, revenueToday: 0 });
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null);

  // ─── NEW ML state ──────────────────────────────────────────────────────────
  const [mlLoading, setMlLoading] = useState(false);
  const [reorderSuggestions, setReorderSuggestions] = useState<(ForecastResult & { product_name: string })[]>([]);

  useEffect(() => {
    if (auth?.id) fetchDashboardData();
  }, [auth]);

  const fetchDashboardData = async () => {
    if (!auth?.id || auth.id === 'undefined') return;
    try {
      setLoading(true);

      const { data: profile } = await supabase
        .from('pharmacy_profiles')
        .select('id')
        .eq('user_id', auth.id)
        .single();

      const realPharmId = profile?.id;
      if (!realPharmId) { setLoading(false); return; }

      const { data: ordersData } = await supabase
        .from('orders')
        .select('status, total_amount, order_date')
        .eq('pharmacy_id', auth.id);

      const { data: invData } = await supabase
        .from('pharmacy_inventory')
        .select('stock_quantity, reorder_level')
        .eq('pharmacy_id', realPharmId);

      const today = new Date().toISOString().split('T')[0];
      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;
      const revenueToday  = ordersData?.filter(o => o.order_date?.startsWith(today)).reduce((s, o) => s + Number(o.total_amount), 0) || 0;
      const lowStock      = invData?.filter(i => i.stock_quantity <= i.reorder_level && i.stock_quantity > 0).length || 0;
      const outOfStock    = invData?.filter(i => i.stock_quantity === 0).length || 0;

      setStats({ pendingOrders, lowStock, outOfStock, revenueToday });

      const { data } = await supabase
        .from('pharmacy_distributors')
        .select(`distributor:distributor_profiles(id,display_name,contact_name,email,city,state,contact_mobile)`)
        .eq('pharmacy_id', realPharmId);
      setDistributors(data?.map((i: any) => i.distributor).filter(Boolean) || []);

      // ─── NEW: Fetch ML reorder suggestions ──────────────────────────────
      fetchMLSuggestions(realPharmId);

    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  // ─── NEW: Call ML API for each low-stock item ────────────────────────────
  // app/pharmacy/dashboard.tsx  — ML section only
// Replace ONLY the fetchMLSuggestions function in your dashboard
// The rest of your dashboard stays exactly the same

// ─── FIND THIS FUNCTION in your dashboard.tsx and REPLACE IT ─────────────────

  const fetchMLSuggestions = async (pharmacyProfileId: string) => {
    setMlLoading(true);
    try {
      // Get low-stock items with product details
      const { data: invItems } = await supabase
        .from('pharmacy_inventory')
        .select(`
          id, stock_quantity, reorder_level,
          products(id, name, sku, price)
        `)
        .eq('pharmacy_id', pharmacyProfileId)
        .lte('stock_quantity', 50);

      if (!invItems || invItems.length === 0) { setMlLoading(false); return; }

      const suggestions: (ForecastResult & { product_name: string })[] = [];

      for (const item of invItems.slice(0, 5)) {
        const product = (item as any).products;
        if (!product) continue;

        const avgDailySales = Math.max(item.reorder_level / 7, 1);

        const result = await getDemandForecast({
          // ✅ Pass auth.id UUID — the function handles conversion to PH_01 format
          supabaseUserId: auth?.id ?? '',
          productId:      product.id,
          productSku:     product.sku,
          currentStock:   item.stock_quantity,
          unitPrice:      product.price || 0,
          salesLast1d:    avgDailySales,
          salesLast7d:    avgDailySales * 7,
          salesLast14d:   avgDailySales * 14,
          salesLast28d:   avgDailySales * 28,
          salesLast91d:   avgDailySales * 91,
        });

        if (result && result.should_order) {
          suggestions.push({ ...result, product_name: product.name });
        }
      }

      const urgencyOrder = [
        'CRITICAL — Out of Stock',
        'URGENT — < 2 days',
        'HIGH — < 5 days',
        'MEDIUM — Order Soon',
        'OK',
      ];
      suggestions.sort((a, b) => urgencyOrder.indexOf(a.urgency) - urgencyOrder.indexOf(b.urgency));
      setReorderSuggestions(suggestions);

    } catch (e) {
      console.error('ML suggestions error:', e);
    } finally {
      setMlLoading(false);
    }
  };

// ─────────────────────────────────────────────────────────────────────────────
// Also update your import at the top of dashboard.tsx:
// REMOVE: import { buildForecastFeatures, ... } from '@/services/swasthyaML';
// ADD:
// import { getDemandForecast, ForecastResult, getUrgencyColor } from '@/services/swasthyaML';
// ─────────────────────────────────────────────────────────────────────────────


  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Pharmacy</Text>
          <Text style={styles.headerSubtitle}>Dashboard Overview</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Grid — unchanged from your original */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Feather name="clock" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statTitle}>Pending Orders</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Feather name="alert-triangle" size={20} color="#EF4444" />
            </View>
            <Text style={styles.statValue}>{stats.lowStock}</Text>
            <Text style={styles.statTitle}>Low Stock</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F3F4F6' }]}>
              <Feather name="slash" size={20} color="#6B7280" />
            </View>
            <Text style={styles.statValue}>{stats.outOfStock}</Text>
            <Text style={styles.statTitle}>Out of Stock</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#D1FAE5' }]}>
              <Feather name="dollar-sign" size={20} color="#10B981" />
            </View>
            <Text style={styles.statValue}>₹{stats.revenueToday.toFixed(0)}</Text>
            <Text style={styles.statTitle}>Revenue Today</Text>
          </View>
        </View>

        {/* ─── NEW: AI Reorder Suggestions Section ─────────────────────── */}
        <View style={mlStyles.sectionHeader}>
          <View style={mlStyles.sectionTitleRow}>
            <Feather name="cpu" size={18} color="#7C3AED" />
            <Text style={mlStyles.sectionTitle}>AI Reorder Suggestions</Text>
          </View>
          <Text style={mlStyles.sectionSubtitle}>Based on your 7-day demand forecast</Text>
        </View>

        {mlLoading ? (
          <View style={mlStyles.mlLoadingBox}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={mlStyles.mlLoadingText}>Running demand forecast...</Text>
          </View>
        ) : reorderSuggestions.length > 0 ? (
          <View style={{ gap: 10, marginBottom: 20 }}>
            {reorderSuggestions.map((item, idx) => (
              <ReorderCard key={idx} item={item} />
            ))}
            <TouchableOpacity
              style={mlStyles.orderNowBtn}
              onPress={() => router.push('/pharmacy/catalog')}
            >
              <Feather name="shopping-cart" size={16} color="#fff" />
              <Text style={mlStyles.orderNowText}>Order Now from Catalog</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={mlStyles.allGoodBox}>
            <Feather name="check-circle" size={28} color="#10B981" />
            <Text style={mlStyles.allGoodText}>All stock levels are good!</Text>
          </View>
        )}
        {/* ─────────────────────────────────────────────────────────────── */}

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/pharmacy/inventory')}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Manage Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/pharmacy/orders')}>
          <Feather name="list" size={20} color="#7C3AED" />
          <Text style={styles.secondaryButtonText}>View All Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }]}
          onPress={() => router.push('/pharmacy/catalog')}
        >
          <Feather name="shopping-cart" size={20} color="#059669" />
          <Text style={[styles.secondaryButtonText, { color: '#059669' }]}>Browse Catalog</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Assigned Distributors</Text>
        </View>

        {distributors.length > 0 ? (
          <View style={{ gap: 12 }}>
            {distributors.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.listItem}
                onPress={() => setSelectedDistributor(item)}
              >
                <View style={styles.distIcon}>
                  <Feather name="truck" size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>{item.display_name || item.contact_name}</Text>
                  <Text style={styles.listItemSubtitle}>
                    {[item.city, item.state].filter(Boolean).join(', ')}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noDistributor}>
            <Feather name="users" size={48} color="#D1D5DB" />
            <Text style={styles.noDistributorText}>
              No distributor assigned yet. Please contact admin.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Distributor Modal — unchanged */}
      <Modal
        visible={!!selectedDistributor}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDistributor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Distributor Details</Text>
              <TouchableOpacity onPress={() => setSelectedDistributor(null)}>
                <Feather name="x" size={24} color="#111827" />
              </TouchableOpacity>
            </View>
            <View style={styles.detailContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name</Text>
                <Text style={styles.detailValue}>{selectedDistributor?.display_name || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Contact Person</Text>
                <Text style={styles.detailValue}>{selectedDistributor?.contact_name || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{selectedDistributor?.email || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone</Text>
                <Text style={styles.detailValue}>{selectedDistributor?.contact_mobile || '—'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>
                  {[selectedDistributor?.city, selectedDistributor?.state].filter(Boolean).join(', ') || '—'}
                </Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#7C3AED' }]} onPress={() => setSelectedDistributor(null)}>
                <Feather name="phone" size={18} color="#fff" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#F5F3FF' }]} onPress={() => setSelectedDistributor(null)}>
                <Feather name="message-square" size={18} color="#7C3AED" />
                <Text style={[styles.actionText, { color: '#7C3AED' }]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── ML Styles (new) ──────────────────────────────────────────────────────────
const mlStyles = StyleSheet.create({
  sectionHeader:    { marginBottom: 12 },
  sectionTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  sectionTitle:     { fontSize: 17, fontWeight: '800', color: '#111827' },
  sectionSubtitle:  { fontSize: 12, color: '#6B7280', marginLeft: 26 },
  mlLoadingBox:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F5F3FF', borderRadius: 12, padding: 16, marginBottom: 20 },
  mlLoadingText:    { color: '#7C3AED', fontSize: 14 },
  reorderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  productName:  { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  urgencyText:  { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  detailText:   { fontSize: 12, color: '#6B7280' },
  badge:        { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  badgeText:    { fontSize: 13, fontWeight: '800' },
  orderNowBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, gap: 8, marginTop: 4 },
  orderNowText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  allGoodBox:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#ECFDF5', borderRadius: 12, padding: 16, marginBottom: 20 },
  allGoodText:  { color: '#065F46', fontSize: 14, fontWeight: '600' },
});

// ─── Original Styles (unchanged) ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle:      { fontSize: 22, fontWeight: '800', color: '#111827' },
  headerSubtitle:   { fontSize: 13, color: '#6B7280', marginTop: 2 },
  logoutBtn:        { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 12 },
  content:          { padding: 20, paddingBottom: 40 },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard:         { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statIcon:         { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue:        { fontSize: 20, fontWeight: '800', color: '#111827' },
  statTitle:        { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  primaryButton:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16, marginBottom: 12, gap: 10, elevation: 2 },
  primaryButtonText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, marginBottom: 24, gap: 10, borderWidth: 1, borderColor: '#DDD6FE' },
  secondaryButtonText:{ color: '#7C3AED', fontSize: 16, fontWeight: '700' },
  sectionHeader:    { marginBottom: 16 },
  sectionTitle:     { fontSize: 18, fontWeight: '800', color: '#111827' },
  listItem:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  distIcon:         { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  listItemTitle:    { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  listItemSubtitle: { fontSize: 13, color: '#6B7280' },
  noDistributor:    { alignItems: 'center', paddingVertical: 32, gap: 12 },
  noDistributorText:{ textAlign: 'center', color: '#9CA3AF', fontSize: 14 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle:       { fontSize: 20, fontWeight: '800', color: '#111827' },
  detailContainer:  { gap: 16, marginBottom: 24 },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  detailLabel:      { fontSize: 14, color: '#6B7280', width: 120 },
  detailValue:      { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, textAlign: 'right' },
  modalActions:     { flexDirection: 'row', gap: 12 },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  actionText:       { color: '#fff', fontWeight: '700', fontSize: 15 },
});
