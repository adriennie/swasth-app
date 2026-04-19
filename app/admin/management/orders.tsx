// app/admin/management/orders.tsx
// ✅ ML INTEGRATED — flags suspicious orders with Isolation Forest

import { supabase } from '@/lib/supabase';
import {
  AnomalyResult,
  detectOrderAnomaly,
  getSeverityColor,
} from '@/services/swasthyaML';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Order {
  id: string;
  pharmacy_id: string;
  distributor_id?: string;
  status: string;
  total_amount: number;
  order_date: string;
  pharmacy_profiles?: { business_legal_name?: string; trade_name?: string };
  // ML fields added after anomaly check
  anomaly?: AnomalyResult | null;
  anomalyChecked?: boolean;
}

export default function ManageOrdersScreen() {
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('orders')
        .select(`
          id, pharmacy_id, distributor_id, status,
          total_amount, order_date,
          pharmacy_profiles(business_legal_name, trade_name)
        `)
        .order('order_date', { ascending: false })
        .limit(50);

      const ordersWithFlag = (data || []).map(o => ({
        ...o,
        anomaly: null,
        anomalyChecked: false,
      }));
      setOrders(ordersWithFlag);

      // ─── Run anomaly detection on pending orders in background ──────────
      checkAnomalies(ordersWithFlag);

    } catch (e) {
      console.error('Fetch orders error:', e);
    } finally {
      setLoading(false);
    }
  };

  const checkAnomalies = async (orderList: Order[]) => {
    // Only check pending orders — those are the ones that need review
    const pending = orderList.filter(o => o.status === 'pending').slice(0, 10);

    for (const order of pending) {
      try {
        // Get order items to find sku and qty
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, unit_price, products(sku)')
          .eq('order_id', order.id)
          .limit(1);

        if (!items || items.length === 0) continue;

        const item    = items[0];
        const product = (item as any).products;

        const result = await detectOrderAnomaly({
          pharmacy_id: order.pharmacy_id,
          sku_id:      product?.sku || `SKU_${item.product_id}`,
          order_qty:   item.quantity,
          order_value: Math.round(item.quantity * item.unit_price),
        });

        // Update that specific order's anomaly flag
        setOrders(prev =>
          prev.map(o =>
            o.id === order.id
              ? { ...o, anomaly: result, anomalyChecked: true }
              : o
          )
        );
      } catch (e) {
        console.error('Anomaly check error for order', order.id, e);
      }
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':   return '#F59E0B';
      case 'approved':  return '#10B981';
      case 'shipped':   return '#3B82F6';
      case 'delivered': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default:          return '#6B7280';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isAnomaly  = item.anomaly?.is_anomaly;
    const severity   = item.anomaly?.severity;
    const sevColor   = severity && severity !== 'NONE' ? getSeverityColor(severity as any) : null;
    const pharmName  = item.pharmacy_profiles?.trade_name
                    || item.pharmacy_profiles?.business_legal_name
                    || item.pharmacy_id;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isAnomaly && { borderWidth: 1.5, borderColor: sevColor || '#EF4444' }
        ]}
        onPress={() => setSelected(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.pharmName}>{pharmName}</Text>
          </View>

          {/* Anomaly badge */}
          {isAnomaly && sevColor && (
            <View style={[styles.anomalyBadge, { backgroundColor: sevColor + '20' }]}>
              <Feather name="alert-triangle" size={12} color={sevColor} />
              <Text style={[styles.anomalyBadgeText, { color: sevColor }]}>
                {severity}
              </Text>
            </View>
          )}

          {/* Loading spinner while checking */}
          {item.status === 'pending' && !item.anomalyChecked && (
            <ActivityIndicator size="small" color="#7C3AED" style={{ marginLeft: 8 }} />
          )}
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.amount}>₹{Number(item.total_amount).toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.date}>
            {new Date(item.order_date).toLocaleDateString('en-IN')}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Orders</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.refreshBtn}>
          <Feather name="refresh-cw" size={18} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Anomaly legend */}
      <View style={styles.legend}>
        <Feather name="cpu" size={13} color="#7C3AED" />
        <Text style={styles.legendText}>
          AI is checking pending orders for suspicious patterns
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No orders found.</Text>
          }
          onRefresh={fetchOrders}
          refreshing={loading}
        />
      )}

      {/* Order Detail Modal with Anomaly Info */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity onPress={() => setSelected(null)}>
                <Feather name="x" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>#{selected?.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: statusColor(selected?.status || '') }]}>
                {selected?.status}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>₹{Number(selected?.total_amount).toLocaleString()}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {selected?.order_date ? new Date(selected.order_date).toLocaleDateString('en-IN') : '—'}
              </Text>
            </View>

            {/* ─── ML Anomaly Section ──────────────────────────────────── */}
            {selected?.anomaly && (
              <View style={[
                styles.anomalyBox,
                { borderColor: selected.anomaly.is_anomaly
                    ? getSeverityColor(selected.anomaly.severity as any)
                    : '#10B981' }
              ]}>
                <View style={styles.anomalyBoxHeader}>
                  <Feather
                    name={selected.anomaly.is_anomaly ? 'alert-triangle' : 'check-circle'}
                    size={16}
                    color={selected.anomaly.is_anomaly
                      ? getSeverityColor(selected.anomaly.severity as any)
                      : '#10B981'}
                  />
                  <Text style={[
                    styles.anomalyBoxTitle,
                    { color: selected.anomaly.is_anomaly
                        ? getSeverityColor(selected.anomaly.severity as any)
                        : '#10B981' }
                  ]}>
                    {selected.anomaly.is_anomaly
                      ? `⚠️ Suspicious Order — ${selected.anomaly.severity}`
                      : '✅ Order Looks Normal'}
                  </Text>
                </View>

                {selected.anomaly.is_anomaly && (
                  <>
                    <Text style={styles.anomalyDetail}>
                      This order is {selected.anomaly.qty_vs_mean.toFixed(1)}x their normal order size
                    </Text>
                    <Text style={styles.anomalyDetail}>
                      Normal avg: {selected.anomaly.normal_avg} units
                    </Text>
                    {selected.anomaly.alert && (
                      <Text style={styles.anomalyAlert}>{selected.anomaly.alert}</Text>
                    )}
                  </>
                )}
              </View>
            )}
            {/* ─────────────────────────────────────────────────────────── */}

            <View style={styles.modalActions}>
              {selected?.status === 'pending' && (
                <>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={() => {
                      // your approve logic here
                      setSelected(null);
                    }}
                  >
                    <Feather name="check" size={16} color="#fff" />
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => {
                      // your reject logic here
                      setSelected(null);
                    }}
                  >
                    <Feather name="x" size={16} color="#fff" />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#F3F4F6', flex: 0.5 }]}
                onPress={() => setSelected(null)}
              >
                <Text style={[styles.actionText, { color: '#374151' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F4F6' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle:    { fontSize: 22, fontWeight: '800', color: '#1F2937' },
  refreshBtn:     { padding: 8, backgroundColor: '#F5F3FF', borderRadius: 10 },
  legend:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#F5F3FF' },
  legendText:     { fontSize: 12, color: '#7C3AED' },
  list:           { padding: 16, gap: 10 },
  emptyText:      { textAlign: 'center', color: '#6B7280', marginTop: 40 },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTop:        { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderId:        { fontSize: 14, fontWeight: '800', color: '#111827' },
  pharmName:      { fontSize: 12, color: '#6B7280', marginTop: 2 },
  anomalyBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  anomalyBadgeText:{ fontSize: 11, fontWeight: '700' },
  cardBottom:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amount:         { fontSize: 15, fontWeight: '800', color: '#111827', flex: 1 },
  statusBadge:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText:     { fontSize: 12, fontWeight: '700' },
  date:           { fontSize: 12, color: '#9CA3AF' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle:     { fontSize: 20, fontWeight: '800', color: '#111827' },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailLabel:    { fontSize: 14, color: '#6B7280' },
  detailValue:    { fontSize: 14, fontWeight: '600', color: '#111827' },
  anomalyBox:     { marginTop: 16, borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 6 },
  anomalyBoxHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  anomalyBoxTitle: { fontSize: 14, fontWeight: '700' },
  anomalyDetail:  { fontSize: 13, color: '#374151' },
  anomalyAlert:   { fontSize: 13, color: '#111827', fontStyle: 'italic', marginTop: 4 },
  modalActions:   { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  actionText:     { color: '#fff', fontWeight: '700', fontSize: 14 },
});
