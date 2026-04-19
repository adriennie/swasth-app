import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  absorbency: string[];
  material: string;
  sustainability: string;
  ingredients: string[];
  benefits: string[];
  certifications: string[];
  description: string;
  howToUse: string[];
  keyFeatures: string[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  absorbency?: string;
}

// Mock product data
const PRODUCT: Product = {
  id: 'p1',
  name: 'UltraSecure Overnight Pads with FlexFit Technology',
  brand: 'FCare Pro',
  price: 24.99,
  originalPrice: 32.99,
  rating: 4.9,
  reviewCount: 2847,
  absorbency: ['Super', 'Super+', 'Overnight'],
  material: 'Organic bamboo fiber with bio-based top sheet',
  sustainability: 'Carbon-negative manufacturing, 100% compostable packaging',
  ingredients: [
    'Organic bamboo fiber',
    'Bio-based polymer top sheet',
    'Plant-based super-absorbent core',
    'Organic cotton backing',
    'Natural adhesive strips'
  ],
  benefits: [
    '12-hour protection guarantee',
    'Hypoallergenic & dermatologist tested',
    'Leak-proof side barriers',
    'Breathable organic materials',
    'Zero plastic packaging'
  ],
  certifications: [
    'GOTS Certified',
    'FSC Certified',
    'Dermatologically Tested',
    'Vegan Society Approved',
    'Carbon Neutral'
  ],
  description: 'Our most advanced overnight pad features revolutionary FlexFit Technology that adapts to your body\'s unique shape and movement. Made with premium organic bamboo fiber and a bio-based top sheet, it provides uncompromising protection while being gentle on sensitive skin and the planet.',
  howToUse: [
    'Remove pad from individual wrapper',
    'Peel off adhesive backing',
    'Center pad on underwear',
    'Press down firmly to secure',
    'Change every 4-6 hours or as needed'
  ],
  keyFeatures: [
    'FlexFit Technology adapts to body shape',
    'Revolutionary 5-layer absorption system',
    '360° leak protection with raised barriers',
    'Organic bamboo fiber top sheet',
    'Zero plastic, fully compostable'
  ]
};

const REVIEWS: Review[] = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2 days ago',
    title: 'Life-changing comfort',
    content: 'These pads are incredible! The bamboo fiber is so soft and I love that they\'re completely plastic-free. No more worrying about leaks during the night.',
    verified: true,
    helpful: 24,
    absorbency: 'Super+'
  },
  {
    id: '2',
    author: 'Jessica L.',
    rating: 5,
    date: '1 week ago',
    title: 'Perfect for sensitive skin',
    content: 'I have very sensitive skin and these are the only pads that don\'t cause irritation. The organic materials make such a difference.',
    verified: true,
    helpful: 18,
    absorbency: 'Super'
  },
  {
    id: '3',
    author: 'Maya P.',
    rating: 4,
    date: '2 weeks ago',
    title: 'Great absorption, eco-friendly',
    content: 'Really impressed with the absorption and the fact that these are completely compostable. Slightly pricier than drugstore brands but worth it for the quality and environmental impact.',
    verified: true,
    helpful: 12,
    absorbency: 'Overnight'
  }
];

function Rating({ value }: { value: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <ThemedText key={i} type="default" style={{ color: i < Math.floor(value) ? '#F59E0B' : '#CBD5E1' }}>★</ThemedText>
      ))}
    </View>
  );
}

function ImageGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ['1', '2', '3', '4', '5'];

  return (
    <View style={styles.imageGallery}>
      <View style={styles.mainImage}>
        <Image
          source={{ uri: 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#E0E7FF"/><stop offset="100%" stop-color="#C7D2FE"/></linearGradient></defs><rect width="100%" height="100%" rx="20" fill="url(#g)"/></svg>`) }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        
        <View style={styles.imageIndicators}>
          {images.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.indicator,
                { backgroundColor: index === currentIndex ? '#FFFFFF' : 'rgba(255,255,255,0.5)' }
              ]}
            />
          ))}
        </View>
      </View>

      <FlatList
        data={images}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailList}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => setCurrentIndex(index)}
            style={[
              styles.thumbnail,
              { borderColor: index === currentIndex ? '#6366F1' : '#E2E8F0' }
            ]}
          >
            <View style={styles.thumbnailImage} />
          </Pressable>
        )}
      />
    </View>
  );
}

function SubscriptionOptions() {
  const [selectedFrequency, setSelectedFrequency] = useState<4 | 6 | 8 | null>(null);
  
  const frequencies = [
    { weeks: 4, discount: 25, label: 'Every 4 weeks', popular: false },
    { weeks: 6, discount: 20, label: 'Every 6 weeks', popular: true },
    { weeks: 8, discount: 15, label: 'Every 8 weeks', popular: false },
  ];

  return (
    <View style={styles.subscriptionBox}>
      <View style={styles.subscriptionHeader}>
        <ThemedText type="defaultSemiBold" style={{ color: '#065F46' }}>📦 Subscribe & Save</ThemedText>
      </View>
      
      <ThemedText type="default" style={{ color: '#047857', marginBottom: 16 }}>
        Never run out and save up to 25% with flexible delivery
      </ThemedText>

      {frequencies.map((freq) => (
        <Pressable
          key={freq.weeks}
          onPress={() => setSelectedFrequency(freq.weeks)}
          style={[
            styles.frequencyOption,
            { 
              borderColor: selectedFrequency === freq.weeks ? '#10B981' : '#A7F3D0',
              backgroundColor: selectedFrequency === freq.weeks ? '#FFFFFF' : 'rgba(255,255,255,0.7)'
            }
          ]}
        >
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemedText type="defaultSemiBold">{freq.label}</ThemedText>
              {freq.popular && (
                <View style={styles.popularBadge}>
                  <ThemedText type="default" style={{ color: '#FFFFFF', fontSize: 12 }}>Most Popular</ThemedText>
                </View>
              )}
            </View>
            <ThemedText type="default" style={{ color: '#059669' }}>Save {freq.discount}%</ThemedText>
          </View>
          
          <View style={[
            styles.radioButton,
            { 
              borderColor: selectedFrequency === freq.weeks ? '#10B981' : '#94A3B8',
              backgroundColor: selectedFrequency === freq.weeks ? '#10B981' : 'transparent'
            }
          ]}>
            {selectedFrequency === freq.weeks && (
              <ThemedText type="default" style={{ color: '#FFFFFF' }}>✓</ThemedText>
            )}
          </View>
        </Pressable>
      ))}

      <View style={styles.subscriptionBenefits}>
        <ThemedText type="default" style={{ color: '#047857', fontSize: 12 }}>✓ Skip or pause anytime</ThemedText>
        <ThemedText type="default" style={{ color: '#047857', fontSize: 12 }}>✓ Free shipping</ThemedText>
        <ThemedText type="default" style={{ color: '#047857', fontSize: 12 }}>✓ Easy to modify</ThemedText>
      </View>
    </View>
  );
}

export default function ProductDetail() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const [selectedAbsorbency, setSelectedAbsorbency] = useState(PRODUCT.absorbency[0]);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'reviews'>('overview');

  const discountPercent = PRODUCT.originalPrice 
    ? Math.round((1 - PRODUCT.price / PRODUCT.originalPrice) * 100)
    : 0;

  const addToPharmacyInventory = async () => {
    try {
      if (auth?.role !== 'pharmacy') return;
      const authPh = JSON.parse((await AsyncStorage.getItem('pharmacy_auth')) || 'null');
      const stores = JSON.parse((await AsyncStorage.getItem('pharmacy_stores')) || '[]');
      const s = stores.find((x: any) => x.id === authPh?.storeId);
      if (!s) {
        Alert.alert('No store found', 'Please add your store details first in Settings.');
        return;
      }
      const catRaw = await AsyncStorage.getItem('global_product_catalog');
      const catalog = catRaw ? JSON.parse(catRaw) : [];
      const item = catalog.find((c: any) => String(c.id) === String(id)) || { id: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, category: 'General' };
      s.inventory = s.inventory || [];
      const exists = (s.inventory || []).some((x: any) => x.name === item.name);
      if (exists) {
        Alert.alert('Already in inventory', 'This product already exists in your inventory.');
        return;
      }
      s.inventory.unshift({ id: `${Date.now()}`, name: item.name, sku: String(item.id), price: item.price, stock: 0, reorderLevel: 5, category: item.category || 'General' });
      const idx = stores.findIndex((x: any) => x.id === s.id);
      stores[idx] = s;
      await AsyncStorage.setItem('pharmacy_stores', JSON.stringify(stores));
      Alert.alert('Added', `${item.name} has been added to your inventory.`);
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="defaultSemiBold">← Back</ThemedText>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Pressable style={styles.iconButton}>
            <ThemedText type="default">🔗</ThemedText>
          </Pressable>
          <Pressable 
            onPress={() => setIsWishlisted(!isWishlisted)}
            style={styles.iconButton}
          >
            <ThemedText type="default">{isWishlisted ? '❤️' : '🤍'}</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Product Images */}
        <ImageGallery />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <ThemedText type="default" style={{ color: '#6366F1', fontWeight: '600', textTransform: 'uppercase' }}>
            {PRODUCT.brand}
          </ThemedText>
          
          <ThemedText type="title" style={{ fontSize: 24, marginTop: 8 }}>
            {PRODUCT.name}
          </ThemedText>

          <View style={styles.ratingRow}>
            <Rating value={PRODUCT.rating} />
            <ThemedText type="defaultSemiBold">{PRODUCT.rating}</ThemedText>
            <ThemedText type="default" style={{ color: '#6366F1' }}>
              {PRODUCT.reviewCount.toLocaleString()} reviews
            </ThemedText>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <ThemedText type="title" style={{ fontSize: 28 }}>${PRODUCT.price}</ThemedText>
            {PRODUCT.originalPrice && (
              <>
                <ThemedText type="default" style={{ color: '#94A3B8', textDecorationLine: 'line-through', fontSize: 18 }}>
                  ${PRODUCT.originalPrice}
                </ThemedText>
                <View style={styles.discountBadge}>
                  <ThemedText type="default" style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    Save {discountPercent}%
                  </ThemedText>
                </View>
              </>
            )}
          </View>

          {/* Key Benefits */}
          <View style={styles.benefitsBox}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Key Benefits</ThemedText>
            {PRODUCT.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <ThemedText type="default" style={{ color: '#10B981' }}>✓</ThemedText>
                <ThemedText type="default" style={{ color: '#374151' }}>{benefit}</ThemedText>
              </View>
            ))}
          </View>

          {/* Absorbency Selection */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Choose Absorbency</ThemedText>
            <View style={styles.absorbencyOptions}>
              {PRODUCT.absorbency.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => setSelectedAbsorbency(level)}
                  style={[
                    styles.absorbencyOption,
                    { 
                      backgroundColor: selectedAbsorbency === level ? '#1F2937' : '#FFFFFF',
                      borderColor: selectedAbsorbency === level ? '#1F2937' : '#E5E7EB'
                    }
                  ]}
                >
                  <ThemedText type="defaultSemiBold" style={{ 
                    color: selectedAbsorbency === level ? '#FFFFFF' : '#374151' 
                  }}>
                    {level}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Quantity */}
          <View style={{ marginBottom: 24 }}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: 12 }}>Quantity</ThemedText>
            <View style={styles.quantitySelector}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.quantityButton}
              >
                <ThemedText type="defaultSemiBold">-</ThemedText>
              </Pressable>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18, minWidth: 40, textAlign: 'center' }}>
                {quantity}
              </ThemedText>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                style={styles.quantityButton}
              >
                <ThemedText type="defaultSemiBold">+</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Add to Cart */}
          <Pressable style={styles.addToCartButton}>
            <ThemedText type="defaultSemiBold" style={{ color: '#FFFFFF', fontSize: 16 }}>
              🛒 Add to Cart - ${(PRODUCT.price * quantity).toFixed(2)}
            </ThemedText>
          </Pressable>

          {auth?.role === 'pharmacy' && (
            <Pressable style={[styles.addToCartButton, { backgroundColor: '#7C3AED' }]} onPress={addToPharmacyInventory}>
              <ThemedText type="defaultSemiBold" style={{ color: '#FFFFFF', fontSize: 16 }}>
                ➕ Add to Inventory
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.trustIndicators}>
            <View style={styles.trustItem}>
              <ThemedText type="default" style={{ fontSize: 12 }}>🚚 Free shipping</ThemedText>
            </View>
            <View style={styles.trustItem}>
              <ThemedText type="default" style={{ fontSize: 12 }}>↩️ Easy returns</ThemedText>
            </View>
            <View style={styles.trustItem}>
              <ThemedText type="default" style={{ fontSize: 12 }}>🔒 Secure payment</ThemedText>
            </View>
          </View>
        </View>

        {/* Subscription Options */}
        <SubscriptionOptions />

        {/* Product Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'ingredients', label: 'Ingredients' },
              { id: 'reviews', label: 'Reviews' }
            ].map((tab) => (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as typeof activeTab)}
                style={[
                  styles.tab,
                  { borderBottomColor: activeTab === tab.id ? '#6366F1' : 'transparent' }
                ]}
              >
                <ThemedText type="defaultSemiBold" style={{ 
                  color: activeTab === tab.id ? '#6366F1' : '#6B7280' 
                }}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === 'overview' && (
              <View>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 12 }}>
                  Product Description
                </ThemedText>
                <ThemedText type="default" style={{ color: '#4B5563', lineHeight: 24, marginBottom: 24 }}>
                  {PRODUCT.description}
                </ThemedText>

                <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 12 }}>
                  Key Features
                </ThemedText>
                {PRODUCT.keyFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <ThemedText type="default" style={{ color: '#6366F1' }}>⚡</ThemedText>
                    <ThemedText type="default" style={{ color: '#374151', flex: 1 }}>{feature}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'ingredients' && (
              <View>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginBottom: 12 }}>
                  Full Ingredients List
                </ThemedText>
                {PRODUCT.ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientRow}>
                    <ThemedText type="default" style={{ color: '#10B981' }}>🌿</ThemedText>
                    <ThemedText type="default" style={{ color: '#374151' }}>{ingredient}</ThemedText>
                  </View>
                ))}

                <ThemedText type="defaultSemiBold" style={{ fontSize: 18, marginTop: 24, marginBottom: 12 }}>
                  Certifications
                </ThemedText>
                {PRODUCT.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationRow}>
                    <ThemedText type="default" style={{ color: '#10B981' }}>🏆</ThemedText>
                    <ThemedText type="defaultSemiBold" style={{ color: '#059669' }}>{cert}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'reviews' && (
              <View>
                <View style={styles.reviewsHeader}>
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                    Customer Reviews ({PRODUCT.reviewCount.toLocaleString()})
                  </ThemedText>
                  <Pressable style={styles.writeReviewButton}>
                    <ThemedText type="defaultSemiBold" style={{ color: '#FFFFFF' }}>Write Review</ThemedText>
                  </Pressable>
                </View>

                {REVIEWS.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <ThemedText type="defaultSemiBold">{review.author}</ThemedText>
                      {review.verified && (
                        <View style={styles.verifiedBadge}>
                          <ThemedText type="default" style={{ color: '#059669', fontSize: 12 }}>✓ Verified</ThemedText>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.reviewMeta}>
                      <Rating value={review.rating} />
                      <ThemedText type="default" style={{ color: '#6B7280' }}>{review.date}</ThemedText>
                      {review.absorbency && (
                        <View style={styles.absorbencyBadge}>
                          <ThemedText type="default" style={{ fontSize: 12 }}>{review.absorbency}</ThemedText>
                        </View>
                      )}
                    </View>

                    <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>{review.title}</ThemedText>
                    <ThemedText type="default" style={{ color: '#4B5563', lineHeight: 20, marginBottom: 12 }}>
                      {review.content}
                    </ThemedText>

                    <View style={styles.reviewActions}>
                      <Pressable style={styles.helpfulButton}>
                        <ThemedText type="default" style={{ color: '#6B7280' }}>👍 Helpful ({review.helpful})</ThemedText>
                      </Pressable>
                      <Pressable>
                        <ThemedText type="default" style={{ color: '#6B7280' }}>💬 Reply</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.select({ ios: 54, android: 24 }),
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingBottom: 40,
  },
  imageGallery: {
    marginBottom: 24,
  },
  mainImage: {
    height: 300,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  thumbnailList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailImage: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  productInfo: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  benefitsBox: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  absorbencyOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  absorbencyOption: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 48,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustItem: {
    alignItems: 'center',
  },
  subscriptionBox: {
    marginHorizontal: 20,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  subscriptionHeader: {
    marginBottom: 8,
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  popularBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionBenefits: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  tabsContainer: {
    marginTop: 16,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  tab: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginRight: 24,
    borderBottomWidth: 2,
  },
  tabContent: {
    padding: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 8,
  },
  certificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    marginBottom: 8,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  writeReviewButton: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  absorbencyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 20,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
})