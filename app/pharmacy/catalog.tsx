import { Chip, HeroHeader, HeroIconButton, Shadow, Tones, type Tone } from '@/components/ui/kit';
import { Palette, Radii } from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { supabase } from '@/lib/supabase';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface Product {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  manufacturer?: string;
  pack_size?: string;
  price: number;
  mrp?: number;
  moq?: number;
  image_url?: string;
  description?: string;
}

type CartItem = { product_id: string; name: string; price: number; image_url?: string; quantity: number };

// Icon and color per catalog category; anything unlisted falls back to "package".
const CATEGORY_STYLE: Record<string, { icon: React.ComponentProps<typeof Feather>['name']; tone: Tone }> = {
  'Pain & Fever': { icon: 'thermometer', tone: 'rose' },
  Antibiotics: { icon: 'shield', tone: 'teal' },
  'Antifungal & Antiviral': { icon: 'shield', tone: 'teal' },
  Allergy: { icon: 'wind', tone: 'amber' },
  Respiratory: { icon: 'wind', tone: 'teal' },
  'Cold & Cough': { icon: 'cloud-drizzle', tone: 'slate' },
  Gastro: { icon: 'coffee', tone: 'amber' },
  Diabetes: { icon: 'droplet', tone: 'rose' },
  Cardiac: { icon: 'heart', tone: 'rose' },
  Thyroid: { icon: 'activity', tone: 'lavender' },
  Neuro: { icon: 'zap', tone: 'lavender' },
  Vitamins: { icon: 'sun', tone: 'amber' },
  "Women's Health": { icon: 'heart', tone: 'lavender' },
  Dermatology: { icon: 'feather', tone: 'teal' },
  'Eye & Ear': { icon: 'eye', tone: 'slate' },
  'First Aid': { icon: 'plus-square', tone: 'rose' },
  Devices: { icon: 'cpu', tone: 'slate' },
};

const formatINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export default function PharmacyCatalogScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Reload the cart whenever the screen regains focus (it can change on the cart screen).
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('pharmacy_cart')
        .then((json) => setCart(json ? JSON.parse(json) : []))
        .catch(() => setCart([]));
    }, [])
  );

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('products')
      .select('id, name, sku, category, manufacturer, pack_size, price, mrp, moq, image_url, description')
      .order('name')
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error(error);
          Alert.alert('Error', 'Failed to load products');
        } else {
          setItems(data || []);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) {
      if (i.category) counts.set(i.category, (counts.get(i.category) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [items]);

  const filtered = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    return items.filter((i) => {
      if (category && i.category !== category) return false;
      if (!s) return true;
      return [i.name, i.sku, i.manufacturer, i.category].some((v) => (v || '').toLowerCase().includes(s));
    });
  }, [items, searchQuery, category]);

  const quantities = useMemo(() => new Map(cart.map((c) => [c.product_id, c.quantity])), [cart]);
  const cartUnits = cart.reduce((sum, c) => sum + c.quantity, 0);

  const addToCart = async (p: Product) => {
    const step = 1;
    const next = [...cart];
    const idx = next.findIndex((c) => c.product_id === p.id);
    if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity + step };
    } else {
      next.push({ product_id: p.id, name: p.name, price: p.price, image_url: p.image_url, quantity: step });
    }
    setCart(next);
    try {
      await AsyncStorage.setItem('pharmacy_cart', JSON.stringify(next));
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to add to cart.');
    }
  };

  const renderItem = ({ item }: { item: Product }) => {
    const style = CATEGORY_STYLE[item.category || ''] || { icon: 'package' as const, tone: 'slate' as Tone };
    const tone = Tones[style.tone];
    const inCart = quantities.get(item.id) || 0;
    const margin = item.mrp && item.mrp > item.price ? Math.round(((item.mrp - item.price) / item.mrp) * 100) : null;

    return (
      <View style={styles.row}>
        <View style={[styles.rowIcon, { backgroundColor: tone.bg }]}>
          <Feather name={style.icon} size={20} color={tone.fg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {[item.manufacturer, item.pack_size].filter(Boolean).join(' · ')}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatINR(item.price)}</Text>
            {item.mrp ? <Text style={styles.mrp}>MRP {formatINR(item.mrp)}</Text> : null}
            {margin ? <Text style={styles.margin}>{margin}% margin</Text> : null}
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name} to cart`}
          onPress={() => addToCart(item)}
          style={({ pressed }) => [styles.add, inCart > 0 && styles.addActive, pressed && { opacity: 0.8 }]}
        >
          {inCart > 0 ? (
            <Text style={styles.addCount}>{inCart}</Text>
          ) : (
            <Feather name="plus" size={18} color={Palette.lavenderText} />
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <HeroHeader
        eyebrow="Order from your distributor"
        title="Browse catalog"
        subtitle={loading ? 'Loading products…' : `${items.length} products · ${categories.length} categories`}
        right={
          <View>
            <HeroIconButton icon="shopping-cart" label="Open cart" onPress={() => router.push('/pharmacy/cart')} />
            {cartUnits > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartUnits > 99 ? '99+' : cartUnits}</Text>
              </View>
            ) : null}
          </View>
        }
      >
        <View style={styles.search}>
          <Feather name="search" size={18} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name, salt, SKU or maker"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search products"
            autoCorrect={false}
          />
          {searchQuery ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setSearchQuery('')} hitSlop={8}>
              <Feather name="x" size={18} color="#64748B" />
            </Pressable>
          ) : null}
        </View>
      </HeroHeader>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipBar}>
        <Chip label="All" count={items.length} active={!category} onPress={() => setCategory(null)} />
        {categories.map(([name, count]) => (
          <Chip key={name} label={name} count={count} active={category === name} onPress={() => setCategory(name)} />
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Palette.lavenderText} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          initialNumToRender={14}
          windowSize={7}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="search" size={28} color="#CBD5E1" />
              <Text style={styles.emptyText}>No products match “{searchQuery}”.</Text>
            </View>
          }
        />
      )}

      {cartUnits > 0 ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/pharmacy/cart')}
          style={({ pressed }) => [styles.cartBar, pressed && { opacity: 0.9 }]}
        >
          <Feather name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.cartBarText}>
            {cartUnits} {cartUnits === 1 ? 'unit' : 'units'} · {formatINR(cart.reduce((s, c) => s + c.price * c.quantity, 0))}
          </Text>
          <Text style={styles.cartBarCta}>Review order</Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.canvas },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginTop: 16,
  },
  searchInput: { fontFamily: Fonts.body.regular, flex: 1, height: 46, fontSize: 15, color: Palette.ink },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { fontFamily: Fonts.label.bold, fontSize: 11, color: Palette.ink },
  chipBar: { flexGrow: 0, flexShrink: 0 },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 110, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: Radii.operational,
    padding: 12,
    ...Shadow,
  },
  rowIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: Fonts.body.semiBold, fontSize: 14, color: Palette.ink },
  meta: { fontFamily: Fonts.body.regular, fontSize: 12, color: '#64748B', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  price: { fontFamily: Fonts.label.bold, fontSize: 15, color: Palette.ink },
  mrp: { fontFamily: Fonts.label.regular, fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through' },
  margin: { fontFamily: Fonts.label.semiBold, fontSize: 11, color: Palette.tealText },
  add: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.lavenderBorder,
    backgroundColor: Palette.lavenderSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addActive: { backgroundColor: Palette.lavenderText, borderColor: Palette.lavenderText },
  addCount: { fontFamily: Fonts.label.bold, fontSize: 14, color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 48 },
  emptyText: { fontFamily: Fonts.body.regular, fontSize: 14, color: '#64748B' },
  cartBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Palette.ink,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...Shadow,
  },
  cartBarText: { fontFamily: Fonts.label.semiBold, fontSize: 14, color: '#fff', flex: 1 },
  cartBarCta: { fontFamily: Fonts.body.bold, fontSize: 14, color: Palette.blush },
});
