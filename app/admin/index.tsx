import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
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

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalDistributors: number;
  totalPharmacies: number;
  pendingApprovals: number;
  activeProducts: number;
  pendingDistributors: number;
  pendingPharmacies: number;
  approvedDistributors: number;
  approvedPharmacies: number;
}

export default function AdminDashboard() {
  const { auth, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalDistributors: 0,
    totalPharmacies: 0,
    pendingApprovals: 0,
    activeProducts: 0,
    pendingDistributors: 0,
    pendingPharmacies: 0,
    approvedDistributors: 0,
    approvedPharmacies: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all stats in parallel
      const [
        ordersResult,
        distributorsResult,
        pharmaciesResult,
        productsResult,
      ] = await Promise.all([
        supabase.from('distributor_admin_orders').select('total_amount, status'),
        supabase.from('distributor_profiles').select('status'),
        supabase.from('pharmacy_profiles').select('status'),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);

      // Calculate total revenue
      const totalRevenue = (ordersResult.data || [])
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

      // Count statuses
      const distributors = distributorsResult.data || [];
      const pharmacies = pharmaciesResult.data || [];

      const pendingDistCount = distributors.filter((d) => d.status === 'pending').length;
      const approvedDistCount = distributors.filter((d) => d.status === 'approved').length;
      const pendingPharmCount = pharmacies.filter((p) => p.status === 'pending').length;
      const approvedPharmCount = pharmacies.filter((p) => p.status === 'approved').length;

      setStats({
        totalRevenue,
        totalOrders: ordersResult.data?.length || 0,
        totalDistributors: distributors.length,
        totalPharmacies: pharmacies.length,
        pendingApprovals: pendingDistCount + pendingPharmCount,
        activeProducts: productsResult.count || 0,
        pendingDistributors: pendingDistCount,
        pendingPharmacies: pendingPharmCount,
        approvedDistributors: approvedDistCount,
        approvedPharmacies: approvedPharmCount,
      });

      // Fetch recent orders with distributor info
      const { data: orders } = await supabase
        .from('distributor_admin_orders')
        .select(`
          *,
          distributor_profiles!distributor_admin_orders_distributor_id_fkey (
            display_name,
            contact_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardStats();
  }, []);

  const statusTone = (status: string): Tone => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'amber';
      case 'completed':
      case 'delivered': return 'teal';
      case 'processing':
      case 'shipped': return 'lavender';
      case 'cancelled':
      case 'rejected': return 'rose';
      default: return 'slate';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.lavenderText} />
        <Text style={styles.loadingText}>Loading network overview…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HeroHeader
        eyebrow="Admin console"
        title="Network overview"
        subtitle={
          stats.pendingApprovals > 0
            ? `${stats.pendingApprovals} ${stats.pendingApprovals === 1 ? 'business is' : 'businesses are'} waiting for approval`
            : 'All businesses are reviewed'
        }
        right={<HeroIconButton icon="log-out" label="Sign out" onPress={logout} />}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Palette.lavenderText} />}
      >
        <View style={styles.statsRow}>
          <FadeIn index={0} style={{ flex: 1 }}>
            <StatTile
              icon="trending-up"
              tone="teal"
              value={`₹${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              label="Distributor purchases"
            />
          </FadeIn>
          <FadeIn index={1} style={{ flex: 1 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/admin/orders')}>
              <StatTile icon="shopping-bag" tone="lavender" value={stats.totalOrders} label="Purchase orders" />
            </Pressable>
          </FadeIn>
        </View>
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <FadeIn index={2} style={{ flex: 1 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/admin/pharmacies')}>
              <StatTile icon="home" tone="teal" value={stats.approvedPharmacies} label="Pharmacies" />
            </Pressable>
          </FadeIn>
          <FadeIn index={3} style={{ flex: 1 }}>
            <Pressable accessibilityRole="button" onPress={() => router.push('/admin/distributors')}>
              <StatTile icon="truck" tone="lavender" value={stats.approvedDistributors} label="Distributors" />
            </Pressable>
          </FadeIn>
          <FadeIn index={4} style={{ flex: 1 }}>
            <StatTile icon="box" tone="slate" value={stats.activeProducts} label="Products" />
          </FadeIn>
        </View>

        {stats.pendingApprovals > 0 ? (
          <FadeIn index={5}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(stats.pendingPharmacies > 0 ? '/admin/pharmacies' : '/admin/distributors')}
              style={({ pressed }) => [styles.approvalBanner, pressed && { opacity: 0.9 }]}
            >
              <View style={styles.approvalIcon}>
                <Feather name="user-check" size={18} color="#B45309" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.approvalTitle}>Approvals waiting</Text>
                <Text style={styles.approvalText}>
                  {stats.pendingPharmacies} {stats.pendingPharmacies === 1 ? 'pharmacy' : 'pharmacies'} ·{' '}
                  {stats.pendingDistributors} {stats.pendingDistributors === 1 ? 'distributor' : 'distributors'}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#B45309" />
            </Pressable>
          </FadeIn>
        ) : null}

        <SectionHeader title="Manage" />
        <FadeIn index={6}>
          <View style={styles.actionsRow}>
            <ActionTile icon="box" tone="amber" title="Products" subtitle={`${stats.activeProducts} in catalog`} onPress={() => router.push('/admin/management/products')} />
            <ActionTile icon="link" tone="lavender" title="Mapping" subtitle="Pharmacy ↔ distributor" onPress={() => router.push('/admin/management/mapping')} />
          </View>
          <View style={[styles.actionsRow, { marginTop: 10 }]}>
            <ActionTile icon="clipboard" tone="teal" title="Orders" subtitle="Purchase orders" onPress={() => router.push('/admin/orders')} />
            <ActionTile icon="cpu" tone="slate" title="ML checks" subtitle="Forecast and anomaly" onPress={() => router.push('/admin/management/ml-test')} />
          </View>
        </FadeIn>

        <SectionHeader
          icon="inbox"
          title="Recent purchase orders"
          action={{ label: 'See all', onPress: () => router.push('/admin/orders') }}
        />

        {recentOrders.length === 0 ? (
          <Card style={styles.emptyState}>
            <Feather name="inbox" size={28} color="#CBD5E1" />
            <Text style={styles.emptyText}>No purchase orders yet</Text>
          </Card>
        ) : (
          <View style={{ gap: 10 }}>
            {recentOrders.map((order, i) => (
              <FadeIn key={order.id} index={i + 7}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.85 }]}
                  onPress={() => router.push('/admin/orders')}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.orderDistributor}>
                      {order.distributor_profiles?.display_name || order.distributor_profiles?.contact_name || 'Unknown distributor'}
                    </Text>
                    <Text style={styles.orderMeta}>
                      #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.orderAmount}>
                      ₹{Number(order.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </Text>
                    <Badge label={order.status} tone={statusTone(order.status)} />
                  </View>
                </Pressable>
              </FadeIn>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.canvas },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: Palette.canvas },
  loadingText: { fontFamily: Fonts.body.regular, fontSize: 14, color: '#64748B' },
  content: { padding: 16, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 12 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  approvalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  approvalIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  approvalTitle: { fontFamily: Fonts.heading.bold, fontSize: 14, color: '#78350F' },
  approvalText: { fontFamily: Fonts.label.medium, fontSize: 12, color: '#92400E', marginTop: 2 },
  orderCard: {
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
  orderDistributor: { fontFamily: Fonts.heading.bold, fontSize: 15, color: Palette.ink },
  orderMeta: { fontFamily: Fonts.label.regular, fontSize: 12, color: '#64748B', marginTop: 2 },
  orderAmount: { fontFamily: Fonts.label.bold, fontSize: 15, color: Palette.ink },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyText: { fontFamily: Fonts.body.regular, color: '#64748B' },
});
