// app/pharmacy/dashboard.tsx
// ✅ ML INTEGRATED — shows AI reorder suggestions below stats

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  ForecastResult,
  getDemandForecast,
} from '@/services/swasthyaML';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActionTile,
  Badge,
  Card,
  FadeIn,
  HeroHeader,
  HeroIconButton,
  SectionHeader,
  StatTile,
  type Tone,
} from '@/components/ui/kit';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

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

// Urgency label from the model ("HIGH — < 5 days") mapped to a badge tone.
function urgencyTone(urgency: string): Tone {
  if (urgency.startsWith('CRITICAL') || urgency.startsWith('URGENT')) return 'rose';
  if (urgency.startsWith('HIGH') || urgency.startsWith('MEDIUM')) return 'amber';
  return 'teal';
}

function ReorderCard({ item }: { item: ForecastResult & { product_name: string } }) {
  const tone = urgencyTone(item.urgency);
  const [level, detail] = item.urgency.split(' — ');

  return (
    <Card style={mlStyles.reorderCard}>
      <View style={mlStyles.reorderHeader}>
        <Text style={mlStyles.productName} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Badge label={level || 'OK'} tone={tone} />
      </View>
      {detail ? <Text style={mlStyles.urgencyText}>{detail}</Text> : null}
      <View style={mlStyles.metrics}>
        <Metric label="Stock" value={`${item.current_stock}`} />
        <Metric label="7d demand" value={`${item.forecast_7d}`} />
        <Metric label="Days left" value={`~${item.days_until_stockout}`} />
        <Metric label="Reorder" value={`${item.reorder_qty}`} strong />
      </View>
      {item.reorder_qty > 0 ? (
        <Text style={mlStyles.orderValue}>Suggested order value ₹{item.order_value.toLocaleString('en-IN')}</Text>
      ) : null}
    </Card>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={[mlStyles.metricValue, strong && { color: Palette.lavenderText }]}>{value}</Text>
      <Text style={mlStyles.metricLabel}>{label}</Text>
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
  const [mlUnavailable, setMlUnavailable] = useState(false);

  useEffect(() => {
    if (auth?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
      setMlLoading(false);
    }
  }, [auth?.id]);

  const fetchDashboardData = async () => {
    if (!auth?.id || auth.id === 'undefined') {
      setLoading(false);
      setMlLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data: profile } = await supabase
        .from('pharmacy_profiles')
        .select('id')
        .eq('user_id', auth.id)
        .single();

      const realPharmId = profile?.id;
      const inventoryOwnerIds = Array.from(new Set([auth.id, realPharmId].filter(Boolean))) as string[];

      const { data: ordersData } = await supabase
        .from('orders')
        .select('status, total_amount, order_date')
        .eq('pharmacy_id', auth.id);

      const { data: invData } = await supabase
        .from('pharmacy_inventory')
        .select('stock_quantity, reorder_level')
        .in('pharmacy_id', inventoryOwnerIds);

      const today = new Date().toISOString().split('T')[0];
      const pendingOrders = ordersData?.filter(o => o.status === 'pending').length || 0;
      const revenueToday  = ordersData?.filter(o => o.order_date?.startsWith(today)).reduce((s, o) => s + Number(o.total_amount), 0) || 0;
      const lowStock      = invData?.filter(i => i.stock_quantity <= i.reorder_level && i.stock_quantity > 0).length || 0;
      const outOfStock    = invData?.filter(i => i.stock_quantity === 0).length || 0;

      setStats({ pendingOrders, lowStock, outOfStock, revenueToday });

      const { data } = await supabase
        .from('pharmacy_distributors')
        .select(`distributor:distributor_profiles(id,display_name,contact_name,email,city,state,contact_mobile)`)
        .eq('pharmacy_id', realPharmId || auth.id);
      setDistributors(data?.map((i: any) => i.distributor).filter(Boolean) || []);

      // ─── NEW: Fetch ML reorder suggestions ──────────────────────────────
      fetchMLSuggestions(inventoryOwnerIds);

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

  const fetchMLSuggestions = async (inventoryOwnerIds: string[]) => {
    setMlLoading(true);
    try {
      setReorderSuggestions([]);
      setMlUnavailable(false);
      if (inventoryOwnerIds.length === 0) {
        return;
      }

      // Get low-stock items with product details
      const { data: invItems } = await supabase
        .from('pharmacy_inventory')
        .select(`
          id, stock_quantity, reorder_level,
          products(id, name, sku, price)
        `)
        .in('pharmacy_id', inventoryOwnerIds)
        .lte('stock_quantity', 200);  // check more items

      if (!invItems || invItems.length === 0) {
        return;
      }

      const suggestions: (ForecastResult & { product_name: string })[] = [];
      let attempted = 0;

      for (const item of invItems.slice(0, 5)) {
        const product = (item as any).products;
        if (!product) continue;

        const avgDailySales = Math.max(item.reorder_level / 7, 1);
        attempted++;

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

        if (result) {
          // Show all predictions — let pharmacy see forecast even if stock seems OK
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
      // Every forecast call failed: the ML service is unreachable, not "all good".
      setMlUnavailable(attempted > 0 && suggestions.length === 0);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.lavenderText} />
      </View>
    );
  }

  const needsAttention = stats.lowStock + stats.outOfStock;

  return (
    <View style={styles.container}>
      <HeroHeader
        eyebrow="Pharmacy workspace"
        title="Today at a glance"
        subtitle={
          needsAttention > 0
            ? `${needsAttention} ${needsAttention === 1 ? 'item needs' : 'items need'} restocking`
            : 'Stock levels are healthy'
        }
        right={<HeroIconButton icon="log-out" label="Sign out" onPress={logout} />}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <FadeIn index={0} style={styles.statCell}>
            <StatTile icon="alert-triangle" tone={stats.lowStock ? 'amber' : 'teal'} value={stats.lowStock} label="Low stock" hint={stats.lowStock ? 'At or below reorder level' : undefined} />
          </FadeIn>
          <FadeIn index={1} style={styles.statCell}>
            <StatTile icon="slash" tone={stats.outOfStock ? 'rose' : 'slate'} value={stats.outOfStock} label="Out of stock" />
          </FadeIn>
          <FadeIn index={2} style={styles.statCell}>
            <StatTile icon="clock" tone="lavender" value={stats.pendingOrders} label="Pending orders" />
          </FadeIn>
          <FadeIn index={3} style={styles.statCell}>
            <StatTile icon="credit-card" tone="teal" value={`₹${stats.revenueToday.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} label="Ordered today" />
          </FadeIn>
        </View>

        <FadeIn index={4}>
          <View style={styles.actions}>
            <ActionTile icon="shopping-bag" tone="lavender" title="Browse catalog" subtitle="250+ products" onPress={() => router.push('/pharmacy/catalog')} />
            <ActionTile icon="package" tone="teal" title="Inventory" subtitle="Stock and batches" onPress={() => router.push('/pharmacy/inventory')} />
            <ActionTile icon="truck" tone="amber" title="Orders" subtitle="Track deliveries" onPress={() => router.push('/pharmacy/orders')} />
          </View>
        </FadeIn>

        <SectionHeader
          icon="cpu"
          title="AI reorder suggestions"
          subtitle="7-day demand forecast for your lowest-stock items"
          action={reorderSuggestions.length ? { label: 'Order now', onPress: () => router.push('/pharmacy/catalog') } : undefined}
        />

        {mlLoading ? (
          <Card style={mlStyles.stateBox}>
            <ActivityIndicator size="small" color={Palette.lavenderText} />
            <Text style={mlStyles.stateText}>Running demand forecast…</Text>
          </Card>
        ) : mlUnavailable ? (
          <Card style={mlStyles.stateBox}>
            <Feather name="cloud-off" size={20} color="#B45309" />
            <Text style={mlStyles.stateText}>Forecast service is unavailable right now. Ordering still works.</Text>
          </Card>
        ) : reorderSuggestions.length > 0 ? (
          <View style={{ gap: 10 }}>
            {reorderSuggestions.map((item, idx) => (
              <FadeIn key={idx} index={idx + 5}>
                <ReorderCard item={item} />
              </FadeIn>
            ))}
          </View>
        ) : (
          <Card style={mlStyles.stateBox}>
            <Feather name="check-circle" size={20} color={Palette.tealText} />
            <Text style={mlStyles.stateText}>No reorders needed this week.</Text>
          </Card>
        )}

        <SectionHeader icon="truck" title="Your distributors" />

        {distributors.length > 0 ? (
          <View style={{ gap: 10 }}>
            {distributors.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                style={({ pressed }) => [styles.listItem, pressed && { opacity: 0.85 }]}
                onPress={() => setSelectedDistributor(item)}
              >
                <View style={styles.distIcon}>
                  <Feather name="truck" size={18} color={Palette.lavenderText} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.listItemTitle}>{item.display_name || item.contact_name}</Text>
                  <Text style={styles.listItemSubtitle}>{[item.city, item.state].filter(Boolean).join(', ')}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </Pressable>
            ))}
          </View>
        ) : (
          <Card style={styles.noDistributor}>
            <Feather name="users" size={28} color="#CBD5E1" />
            <Text style={styles.noDistributorText}>No distributor assigned yet. Orders go to the admin queue.</Text>
          </Card>
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
                <Feather name="x" size={24} color={Palette.ink} />
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
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Palette.lavenderText }]} onPress={() => setSelectedDistributor(null)}>
                <Feather name="phone" size={18} color="#fff" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Palette.lavenderSoft }]} onPress={() => setSelectedDistributor(null)}>
                <Feather name="message-square" size={18} color={Palette.lavenderText} />
                <Text style={[styles.actionText, { color: Palette.lavenderText }]}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── ML Styles (new) ──────────────────────────────────────────────────────────
const mlStyles = StyleSheet.create({
  reorderCard: { gap: 6 },
  reorderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productName: { fontFamily: Fonts.body.bold, flex: 1, fontSize: 15, color: Palette.ink },
  urgencyText: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#64748B' },
  metrics: { flexDirection: 'row', marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  metricValue: { fontFamily: Fonts.label.bold, fontSize: 16, color: Palette.ink },
  metricLabel: { fontFamily: Fonts.label.regular, fontSize: 11, color: '#64748B', marginTop: 1 },
  orderValue: { fontFamily: Fonts.label.semiBold, fontSize: 12, color: Palette.tealText, marginTop: 4 },
  stateBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stateText: { fontFamily: Fonts.body.regular, color: '#475569', fontSize: 14, flex: 1 },
});

// ─── Original Styles (unchanged) ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: Palette.canvas },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Palette.canvas },
  statCell:         { width: '48%' },
  actions:          { flexDirection: 'row', gap: 10 },
  content:          { padding: 16, paddingBottom: 40 },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginBottom: 12 },
  primaryButtonText:{ fontFamily: Fonts.body.bold, color: '#fff', fontSize: 16 },
  secondaryButtonText:{ fontFamily: Fonts.body.bold, color: Palette.lavenderText, fontSize: 16 },
  listItem:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 12, shadowColor: Palette.ink, shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  distIcon:         { width: 38, height: 38, borderRadius: 10, backgroundColor: Palette.lavenderSoft, alignItems: 'center', justifyContent: 'center' },
  listItemTitle:    { fontFamily: Fonts.heading.bold, fontSize: 15, color: Palette.ink, marginBottom: 2 },
  listItemSubtitle: { fontFamily: Fonts.body.regular, fontSize: 13, color: '#6B7280' },
  noDistributor:    { alignItems: 'center', paddingVertical: 24, gap: 10 },
  noDistributorText:{ fontFamily: Fonts.body.regular, textAlign: 'center', color: '#9CA3AF', fontSize: 14 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  modalTitle:       { fontFamily: Fonts.heading.extraBold, fontSize: 20, color: Palette.ink },
  detailContainer:  { gap: 16, marginBottom: 24 },
  detailRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 12 },
  detailLabel:      { fontFamily: Fonts.body.regular, fontSize: 14, color: '#6B7280', width: 120 },
  detailValue:      { fontFamily: Fonts.label.semiBold, fontSize: 15, color: Palette.ink, flex: 1, textAlign: 'right' },
  modalActions:     { flexDirection: 'row', gap: 12 },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12 },
  actionText:       { fontFamily: Fonts.body.bold, color: '#fff', fontSize: 15 },
});
