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
    TouchableOpacity,
    View
} from 'react-native';
import { Palette } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';

interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    products: {
        name: string;
        distributor_price?: number;
        price?: number;
        sku: string;
        image_url?: string;
        moq?: number;
    };
}

export default function DistributorCart() {
    const { auth } = useAuth();
    const router = useRouter();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentVisible, setPaymentVisible] = useState(false);

    useEffect(() => {
        if (auth?.id) {
            fetchCart(auth.id);
        } else {
            setLoading(false);
        }
    }, [auth?.id]);

    const fetchCart = async (distId: string) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('distributor_cart_items')
                .select(`
                  id,
                  product_id,
                  quantity,
                  products (
                    name,
                    distributor_price,
                    sku,
                    image_url,
                    moq
                  )
                `)
                .eq('distributor_id', distId);

            if (error) throw error;
            setCartItems((data as unknown) as CartItem[] || []);
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to fetch cart.');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (itemId: string, newQty: number) => {
        if (newQty < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));

        try {
            const { error } = await supabase
                .from('distributor_cart_items')
                .update({ quantity: newQty })
                .eq('id', itemId);
            if (error) throw error;
        } catch (e) {
            console.error(e);
            if (auth?.id) fetchCart(auth.id);
        }
    };

    const removeFromCart = async (itemId: string) => {
        Alert.alert('Remove Item', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const { error } = await supabase.from('distributor_cart_items').delete().eq('id', itemId);
                        if (error) throw error;
                        setCartItems(prev => prev.filter(i => i.id !== itemId));
                    } catch (e) {
                        console.error(e);
                        Alert.alert('Error', 'Failed to remove item.');
                    }
                }
            }
        ]);
    };

    const placeOrder = async () => {
        if (!auth?.id || cartItems.length === 0) return;

        // Validate MOQ
        const itemsBelowMoq = cartItems.filter(item => {
            const moq = item.products?.moq || 1;
            return item.quantity < moq;
        });

        if (itemsBelowMoq.length > 0) {
            const itemsList = itemsBelowMoq.map(item =>
                `• ${item.products?.name}: ${item.quantity} units (MOQ: ${item.products?.moq || 1})`
            ).join('\n');

            Alert.alert(
                'Minimum Order Quantity Not Met',
                `The following items do not meet the minimum order quantity:\n\n${itemsList}\n\nPlease update quantities to proceed.`,
                [{ text: 'OK' }]
            );
            return;
        }

        setPaymentVisible(true);

        setTimeout(async () => {
            try {
                const totalAmount = cartItems.reduce((sum, item) => {
                    const price = Number(item.products?.distributor_price) || 0;
                    return sum + (item.quantity * price);
                }, 0);

                // 1. Create Order
                const { data: orderData, error: orderError } = await supabase
                    .from('distributor_admin_orders')
                    .insert({
                        distributor_id: auth.id,
                        total_amount: totalAmount,
                        status: 'Pending'
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;

                // 2. Create Order Items
                const orderItems = cartItems.map(item => ({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: Number(item.products?.distributor_price) || 0
                }));

                const { error: itemsError } = await supabase
                    .from('distributor_admin_order_items')
                    .insert(orderItems);

                if (itemsError) throw itemsError;

                // 3. Clear Cart
                const { error: clearError } = await supabase
                    .from('distributor_cart_items')
                    .delete()
                    .eq('distributor_id', auth.id);

                if (clearError) throw clearError;

                setPaymentVisible(false);
                Alert.alert('Success', 'Order placed successfully!');
                router.replace('/distributor/orders-to-admin');
            } catch (e) {
                console.error(e);
                setPaymentVisible(false);
                Alert.alert('Error', 'Failed to place order.');
            }
        }, 2000);
    };

    const total = cartItems.reduce((sum, item) => {
        const price = Number(item.products?.distributor_price) || 0;
        return sum + (item.quantity * price);
    }, 0);

    const moqViolations = cartItems.filter(item => item.quantity < (item.products?.moq || 1));
    const hasMoqViolations = moqViolations.length > 0;

    const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#059669" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="chevron-left" size={24} color={Palette.ink} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <View style={{ width: 24 }} />
            </View>

            <FlatList
                data={cartItems}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={cartItems.length > 0 ? styles.cardRow : undefined}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.list, cartItems.length === 0 && styles.emptyList]}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Feather name="shopping-cart" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Your cart is empty</Text>
                        <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/distributor/catalogue')}>
                            <Text style={styles.browseBtnText}>Browse Catalogue</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => {
                    const moq = item.products?.moq || 1;
                    const isBelowMoq = item.quantity < moq;

                    return (
                        <View style={[styles.card, isBelowMoq && styles.cardError]}>
                            <View style={styles.imageWrap}>
                                {item.products?.image_url ? (
                                    <Image source={{ uri: item.products.image_url }} style={styles.productImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Feather name="package" size={30} color="#D1D5DB" />
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardBody}>
                                <Text style={styles.name} numberOfLines={2}>{item.products?.name || 'Product unavailable'}</Text>
                                <Text style={styles.sku} numberOfLines={1}>SKU: {item.products?.sku || 'N/A'}</Text>
                                <Text style={styles.price}>{formatCurrency(Number(item.products?.distributor_price || 0))}</Text>

                                <View style={[styles.moqContainer, isBelowMoq ? styles.moqWarningContainer : styles.moqBadgeContainer]}>
                                    <Feather
                                        name={isBelowMoq ? 'alert-circle' : 'info'}
                                        size={14}
                                        color={isBelowMoq ? '#DC2626' : Palette.lavenderDeep}
                                    />
                                    <Text style={[styles.moqText, isBelowMoq ? styles.moqWarningText : styles.moqBadgeText]}>
                                        {isBelowMoq ? `Minimum ${moq} units required. Current: ${item.quantity}.` : `MOQ ${moq} units`}
                                    </Text>
                                </View>

                                <View style={styles.quantitySection}>
                                    <Text style={styles.quantityLabel}>Quantity</Text>
                                    <View style={[styles.controls, isBelowMoq && styles.controlsError]}>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                        >
                                            <Feather name="minus" size={16} color="#4B5563" />
                                        </TouchableOpacity>
                                        <Text style={[styles.qty, isBelowMoq && styles.qtyError]}>{item.quantity}</Text>
                                        <TouchableOpacity
                                            style={styles.qtyBtn}
                                            onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                        >
                                            <Feather name="plus" size={16} color="#4B5563" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.lineTotal}>
                                    Total {formatCurrency(item.quantity * Number(item.products?.distributor_price || 0))}
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />

            {cartItems.length > 0 && (
                <View style={styles.footer}>
                    {hasMoqViolations && (
                        <View style={styles.footerWarning}>
                            <Feather name="alert-triangle" size={16} color="#B91C1C" />
                            <Text style={styles.footerWarningText}>
                                Checkout blocked: {moqViolations.length} item{moqViolations.length === 1 ? '' : 's'} below MOQ. Increase the highlighted quantities to continue.
                            </Text>
                        </View>
                    )}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.checkoutBtn,
                            hasMoqViolations && styles.checkoutBtnBlocked
                        ]}
                        onPress={placeOrder}
                        disabled={paymentVisible}
                    >
                        {paymentVisible ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.checkoutBtnText}>
                                {hasMoqViolations ? 'Resolve MOQ Issues to Continue' : 'Place Order'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Payment Modal */}
            {paymentVisible && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ActivityIndicator size="large" color="#059669" />
                        <Text style={styles.modalText}>Processing Payment...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.canvas },
    header: {
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontFamily: Fonts.heading.extraBold, fontSize: 18, color: Palette.ink },
    list: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 24, flexGrow: 1 },
    emptyList: { justifyContent: 'center' },
    cardRow: { justifyContent: 'space-between', marginBottom: 12 },
    card: {
        width: '48.5%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    cardError: {
        borderColor: '#FCA5A5',
        backgroundColor: '#FFF7F7',
    },
    imageWrap: {
        width: '100%',
        height: 112,
        backgroundColor: Palette.canvas,
        alignItems: 'center',
        justifyContent: 'center',
    },
    productImage: { width: 104, height: 104, borderRadius: 12, resizeMode: 'cover' },
    placeholderImage: { width: 104, height: 104, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
    cardBody: { flex: 1, padding: 12, alignItems: 'center', gap: 8 },
    name: { fontFamily: Fonts.body.extraBold, fontSize: 14, color: Palette.ink, lineHeight: 18, textAlign: 'center', minHeight: 36 },
    sku: { fontFamily: Fonts.body.bold, fontSize: 10, color: '#9CA3AF', textAlign: 'center', maxWidth: '100%' },
    price: { fontFamily: Fonts.label.extraBold, fontSize: 18, color: Palette.tealText, textAlign: 'center' },
    moqContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderRadius: 10,
        width: '100%',
    },
    moqBadgeContainer: {
        backgroundColor: Palette.lavenderSoft,
    },
    moqWarningContainer: {
        backgroundColor: '#FEE2E2',
    },
    moqText: {
        fontFamily: Fonts.body.bold,
        flex: 1,
        fontSize: 11,
        lineHeight: 15,
    },
    moqBadgeText: { color: Palette.lavenderDeep },
    moqWarningText: { color: '#DC2626' },
    quantitySection: { width: '100%', gap: 6 },
    quantityLabel: { fontFamily: Fonts.label.extraBold, fontSize: 11, color: '#6B7280', textAlign: 'center' },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Palette.canvas,
        borderRadius: 12,
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    controlsError: {
        backgroundColor: '#FFF1F2',
        borderColor: '#FCA5A5',
    },
    qtyBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 9, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
    qty: { fontFamily: Fonts.label.extraBold, fontSize: 16, color: Palette.ink, minWidth: 30, textAlign: 'center' },
    qtyError: { color: '#B91C1C' },
    lineTotal: { fontFamily: Fonts.label.extraBold, fontSize: 12, color: '#374151', textAlign: 'center' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 12 },
    footerWarning: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', padding: 12, borderRadius: 14 },
    footerWarningText: { fontFamily: Fonts.body.semiBold, flex: 1, color: '#991B1B', fontSize: 13, lineHeight: 18 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    totalLabel: { fontFamily: Fonts.label.regular, fontSize: 16, color: '#6B7280' },
    totalValue: { fontFamily: Fonts.heading.extraBold, fontSize: 24, color: Palette.tealText },
    checkoutBtn: { backgroundColor: Palette.lavenderText, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
    checkoutBtnBlocked: { backgroundColor: '#DC2626' },
    checkoutBtnText: { fontFamily: Fonts.body.bold, color: '#fff', fontSize: 16 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60 },
    emptyText: { fontFamily: Fonts.body.regular, fontSize: 18, color: '#9CA3AF', marginTop: 16, marginBottom: 24 },
    browseBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#E5E7EB', borderRadius: 10 },
    browseBtnText: { fontFamily: Fonts.body.bold, color: '#374151' },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    modalText: {
        fontFamily: Fonts.body.semiBold,
        marginTop: 16,
        fontSize: 16,
        color: Palette.ink,
    },
});
