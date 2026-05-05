import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface Product {
    id: string;
    name: string;
    description?: string;
    distributor_price?: number;
    price?: number;
    sku?: string;
    image_url?: string;
    moq?: number;
}

export default function DistributorCatalogue() {
    const router = useRouter();
    const { auth } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to fetch catalogue.');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product: Product) => {
        if (!auth?.id) return;

        const moq = product.moq || 1;

        try {
            // 1. Get Distributor Profile ID
            const { data: profile } = await supabase
                .from('distributor_profiles')
                .select('id')
                .eq('user_id', auth.id)
                .single();

            if (!profile) {
                Alert.alert('Error', 'Distributor profile not found.');
                return;
            }

            const { data: existing } = await supabase
                .from('distributor_cart_items')
                .select('id, quantity')
                .eq('distributor_id', auth.id)
                .eq('product_id', product.id)
                .maybeSingle();

            if (existing) {
                const newQuantity = existing.quantity + 1;
                const { error } = await supabase
                    .from('distributor_cart_items')
                    .update({ quantity: newQuantity })
                    .eq('id', existing.id);
                if (error) throw error;
                Alert.alert('Updated', `Quantity increased to ${newQuantity} units.`);
            } else {
                if (moq > 1) {
                    Alert.alert(
                        'Minimum Order Quantity',
                        `This product requires a minimum order of ${moq} units.\n\nWould you like to add ${moq} units to your cart?`,
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: `Add ${moq} Units`,
                                onPress: async () => {
                                    try {
                                        const { error } = await supabase
                                            .from('distributor_cart_items')
                                            .insert({
                                                distributor_id: auth.id,
                                                product_id: product.id,
                                                quantity: moq
                                            });
                                        if (error) throw error;
                                        Alert.alert('Success', `${moq} units added to cart.`);
                                    } catch (e) {
                                        console.error(e);
                                        Alert.alert('Error', 'Failed to add to cart.');
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }

                const { error } = await supabase
                    .from('distributor_cart_items')
                    .insert({
                        distributor_id: auth.id,
                        product_id: product.id,
                        quantity: 1
                    });
                if (error) throw error;
                Alert.alert('Success', 'Item added to cart.');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to add to cart.');
        }
    };

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Feather name="chevron-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.headerTextWrap}>
                    <Text style={styles.headerTitle}>Master Catalogue</Text>
                    <Text style={styles.headerSubtitle}>Browse products, pricing, and margin at a glance</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/distributor/cart')} style={styles.cartBtn}>
                    <Feather name="shopping-cart" size={24} color="#1F2937" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchRow}>
                    <Feather name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products by name or SKU..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Total: {products.length}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.metaText}>Showing: {filtered.length}</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading catalogue...</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.imageContainer}>
                                {item.image_url ? (
                                    <Image source={{ uri: item.image_url }} style={styles.productImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Feather name="box" size={32} color="#D1D5DB" />
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardInfo}>
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                                        <Text style={styles.sku}>SKU: {item.sku || 'N/A'}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                                        <Feather name="plus" size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {item.description && (
                                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                                )}

                                {item.moq && item.moq > 1 && (
                                    <View style={styles.moqInlineBadge}>
                                        <Feather name="alert-circle" size={12} color="#4338CA" />
                                        <Text style={styles.moqInlineText}>MOQ {item.moq} units</Text>
                                    </View>
                                )}

                                <View style={styles.priceContainer}>
                                    <View style={styles.priceItem}>
                                        <Text style={styles.priceLabel}>Your Cost</Text>
                                        <Text style={styles.costPrice}>₹{(item.distributor_price || 0).toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.priceItem}>
                                        <Text style={styles.priceLabel}>Retail (MSRP)</Text>
                                        <Text style={styles.retailPrice}>₹{(item.price || 0).toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.marginItem}>
                                        <Text style={styles.priceLabel}>Margin</Text>
                                        <Text style={styles.marginText}>
                                            ₹{((item.price || 0) - (item.distributor_price || 0)).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Feather name="package" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No products found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTextWrap: {
        flex: 1,
        marginHorizontal: 10,
        paddingTop: 6,
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
    cartBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111827',
    },
    headerSubtitle: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7280',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#F3F4F6',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, color: '#1F2937' },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    metaDivider: {
        marginHorizontal: 8,
        color: '#9CA3AF',
        fontSize: 12,
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontWeight: '600' },
    list: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 4 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        flexDirection: 'row',
    },
    imageContainer: {
        width: 104,
        minHeight: 132,
        backgroundColor: '#F9FAFB',
        borderRightWidth: 1,
        borderRightColor: '#F3F4F6',
    },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1, padding: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
    name: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, lineHeight: 20 },
    sku: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
    addBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#4F46E5',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#4F46E5',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    desc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
    moqInlineBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 8,
    },
    moqInlineText: {
        fontSize: 11,
        color: '#4338CA',
        fontWeight: '700',
    },
    priceContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 10,
        gap: 8,
    },
    priceItem: { flex: 1 },
    marginItem: { flex: 1, alignItems: 'flex-end' },
    priceLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginBottom: 3 },
    costPrice: { fontSize: 13, fontWeight: '800', color: '#111827' },
    retailPrice: { fontSize: 13, fontWeight: '800', color: '#4F46E5' },
    marginText: { fontSize: 13, fontWeight: '800', color: '#10B981' },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 16 },
});
