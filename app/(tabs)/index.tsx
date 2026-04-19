import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  discount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  category: string;
  tags: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'UltraSecure Overnight Pads',
    brand: 'FCare',
    price: 24.99,
    originalPrice: 29.99,
    rating: 4.9,
    reviewCount: 1247,
    discount: 17,
    isBestseller: true,
    category: 'Period Care',
    tags: ['heavyFlow', 'pads', 'eco'],
  },
  {
    id: 'p2',
    name: 'FlexFit Organic Tampons',
    brand: 'FCare Pro',
    price: 19.99,
    rating: 4.8,
    reviewCount: 892,
    isNew: true,
    category: 'Period Care',
    tags: ['tampons', 'organic'],
  },
  {
    id: 'p3',
    name: 'Harmony PCOS Complete',
    brand: 'HerLabs',
    price: 89.99,
    rating: 4.7,
    reviewCount: 567,
    isBestseller: true,
    category: 'Wellness',
    tags: ['pcos', 'supplement'],
  },
  {
    id: 'p4',
    name: 'Gentle Balance pH Cleanser',
    brand: 'FCare Wellness',
    price: 32.99,
    rating: 4.6,
    reviewCount: 423,
    category: 'Hygiene',
    tags: ['sensitiveSkin', 'wash'],
  },
  {
    id: 'p5',
    name: 'CloudSoft Daily Comfort',
    brand: 'FCare',
    price: 16.99,
    rating: 4.5,
    reviewCount: 756,
    category: 'Period Care',
    tags: ['pads', 'sensitiveSkin'],
  },
  {
    id: 'p6',
    name: 'FlexCup Pro Menstrual Cup',
    brand: 'FCare Innovation',
    price: 45.99,
    rating: 4.8,
    reviewCount: 1034,
    isBestseller: true,
    category: 'Period Care',
    tags: ['cup', 'eco'],
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid' },
  { id: 'period-care', name: 'Period Care', icon: 'heart' },
  { id: 'wellness', name: 'Wellness', icon: 'leaf' },
  { id: 'hygiene', name: 'Hygiene', icon: 'water' },
];

export default function ShopScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState<{ [key: string]: { product: Product; quantity: number } }>({});
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  };

  const saveCart = async (newCart: any) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addToCart = (product: Product) => {
    const newCart = { ...cart };
    if (newCart[product.id]) {
      newCart[product.id].quantity += 1;
    } else {
      newCart[product.id] = { product, quantity: 1 };
    }
    setCart(newCart);
    saveCart(newCart);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart!`);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const filteredProducts = useMemo(() => {
    let filtered = PRODUCTS;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [searchQuery, selectedCategory]);

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.9}
    >
      <View style={styles.productImage}>
        <LinearGradient
          colors={['#FFDEE9', '#B5FFFC']}
          style={styles.imageGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="cube" size={32} color="rgba(255,255,255,0.8)" />
        </LinearGradient>
        
        <View style={styles.badgeContainer}>
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {product.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Text style={styles.badgeText}>TOP</Text>
            </View>
          )}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.badgeText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => setWishlist(prev => 
            prev.includes(product.id) 
              ? prev.filter(id => id !== product.id)
              : [...prev, product.id]
          )}
        >
          <Ionicons
            name={wishlist.includes(product.id) ? "heart" : "heart-outline"}
            size={20}
            color={wishlist.includes(product.id) ? "#FF6B9D" : "#666"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        
        <View style={styles.productMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
          </View>
          
          <View style={styles.priceContainer}>
            {product.originalPrice ? (
              <>
                <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                <Text style={styles.currentPrice}>${product.price}</Text>
              </>
            ) : (
              <Text style={styles.currentPrice}>${product.price}</Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={() => addToCart(product)}
        >
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.addToCartGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="bag-outline" size={16} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="heart" size={24} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>FCare</Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton}>
              <Ionicons name="bag" size={24} color="#333" />
              {getCartCount() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getCartCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, brands, or symptoms..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#FF6B9D' : '#666'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#FF6B9D', '#FF8E53']}
            style={styles.heroGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Shop Discreetly</Text>
              <Text style={styles.heroSubtitle}>Feel empowered with premium menstrual care</Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Take Product Quiz</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.heroImage}>
              <Ionicons name="bag" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          </LinearGradient>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results (${filteredProducts.length})` : 'Featured Products'}
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            renderItem={({ item }) => <ProductCard product={item} />}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B9D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    gap: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  categoryTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  heroGradient: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  heroImage: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productsSection: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B9D',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  productImage: {
    position: 'relative',
    height: 160,
  },
  imageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    gap: 6,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestsellerBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  productInfo: {
    padding: 16,
  },
  productBrand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 18,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewCount: {
    fontSize: 11,
    color: '#666',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  addToCartButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addToCartGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
}); 