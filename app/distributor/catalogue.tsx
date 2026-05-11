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
        if (!auth?.id) {
            Alert.alert('Error', 'You must be logged in to add products to cart.');
            return;
        }

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
                <Text style={styles.headerTitle}>Master Catalogue</Text>
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
                    numColumns={2}
                    columnWrapperStyle={filtered.length > 0 ? styles.cardRow : undefined}
                    contentContainerStyle={[styles.list, filtered.length === 0 && styles.emptyList]}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.productCard}>
                            <View style={styles.imageContainer}>
                                {item.image_url ? (
                                    <Image source={{ uri: item.image_url }} style={styles.productImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Feather name="box" size={32} color="#D1D5DB" />
                                    </View>
                                )}
                            </View>

                            <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                            <Text style={styles.price}>₹{(item.distributor_price || 0).toLocaleString('en-IN')}</Text>

                            {item.moq && item.moq > 1 && (
                                <View style={styles.moqBadge}>
                                    <Feather name="info" size={11} color="#4338CA" />
                                    <Text style={styles.moqText}>MOQ {item.moq}</Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
                                <Feather name="plus" size={18} color="#fff" />
                                <Text style={styles.addBtnText}>Add to Cart</Text>
                            </TouchableOpacity>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 44,
        paddingBottom: 22,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#111827',
    },
    searchContainer: {
        paddingHorizontal: 24,
        paddingTop: 26,
        paddingBottom: 22,
        backgroundColor: '#F3F4F6',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 18,
        height: 58,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 18, color: '#1F2937' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#6B7280', fontWeight: '600' },
    list: { paddingHorizontal: 26, paddingBottom: 32, paddingTop: 18 },
    emptyList: { flexGrow: 1 },
    cardRow: { justifyContent: 'space-between', marginBottom: 26 },
    productCard: {
        width: '48.5%',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 7,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    imageContainer: {
        width: 112,
        height: 112,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F9FAFB',
        marginBottom: 14,
    },
    productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    placeholderImage: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
    name: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111827',
        lineHeight: 19,
        textAlign: 'center',
        minHeight: 40,
        marginBottom: 12,
    },
    price: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2563EB',
        marginBottom: 10,
    },
    moqBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#EEF2FF',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginBottom: 10,
    },
    moqText: {
        fontSize: 10,
        color: '#4338CA',
        fontWeight: '800',
    },
    addBtn: {
        width: '100%',
        minHeight: 44,
        borderRadius: 10,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
        elevation: 2,
        shadowColor: '#7C3AED',
        shadowOpacity: 0.22,
        shadowRadius: 4,
    },
    addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { marginTop: 12, color: '#9CA3AF', fontSize: 16 },
});
