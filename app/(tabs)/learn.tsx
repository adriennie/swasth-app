import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  conditions?: string[];
  symptoms?: string[];
  goals?: string[];
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  tags: string[];
  isFeatured?: boolean;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  articleCount: number;
}

const TOPICS: Topic[] = [
  {
    id: 'cycle-basics',
    title: 'Cycle Basics',
    description: 'Understanding your menstrual cycle',
    icon: 'calendar',
    color: '#FF6B9D',
    articleCount: 12,
  },
  {
    id: 'conditions',
    title: 'Health Conditions',
    description: 'PCOS, Endometriosis & more',
    icon: 'medical',
    color: '#4ECDC4',
    articleCount: 8,
  },
  {
    id: 'product-guides',
    title: 'Product Guides',
    description: 'How to use menstrual products',
    icon: 'cube',
    color: '#FF8E53',
    articleCount: 15,
  },
  {
    id: 'sexual-health',
    title: 'Sexual Health',
    description: 'Safe practices & education',
    icon: 'heart',
    color: '#A78BFA',
    articleCount: 6,
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'Foods for menstrual health',
    icon: 'nutrition',
    color: '#10B981',
    articleCount: 10,
  },
  {
    id: 'mental-wellness',
    title: 'Mental Wellness',
    description: 'Managing PMS & mood changes',
    icon: 'brain',
    color: '#F59E0B',
    articleCount: 9,
  },
];

const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Understanding Your Menstrual Cycle: A Complete Guide',
    excerpt: 'Learn about the four phases of your cycle and how they affect your body, mood, and energy levels.',
    category: 'Cycle Basics',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    tags: ['cycle-basics', 'beginners'],
    isFeatured: true,
  },
  {
    id: '2',
    title: 'PCOS Diet: Foods That Help Manage Symptoms',
    excerpt: 'Discover the best foods to eat and avoid when managing PCOS symptoms naturally.',
    category: 'Nutrition',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop',
    tags: ['pcos', 'nutrition', 'diet'],
  },
  {
    id: '3',
    title: 'How to Use a Menstrual Cup: Step-by-Step Guide',
    excerpt: 'Everything you need to know about choosing, inserting, and caring for your menstrual cup.',
    category: 'Product Guides',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    tags: ['menstrual-cup', 'product-guides'],
  },
  {
    id: '4',
    title: 'Managing PMS: Natural Remedies That Actually Work',
    excerpt: 'From herbal supplements to lifestyle changes, find relief from PMS symptoms naturally.',
    category: 'Mental Wellness',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    tags: ['pms', 'mental-wellness', 'natural-remedies'],
  },
  {
    id: '5',
    title: 'Endometriosis: Symptoms, Diagnosis & Treatment',
    excerpt: 'A comprehensive guide to understanding endometriosis and available treatment options.',
    category: 'Health Conditions',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    tags: ['endometriosis', 'health-conditions'],
  },
  {
    id: '6',
    title: 'Myth vs. Fact: Debunking Period Misconceptions',
    excerpt: 'Separating fact from fiction about menstruation and reproductive health.',
    category: 'Cycle Basics',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop',
    tags: ['myths', 'education', 'cycle-basics'],
  },
];

const MYTHS_FACTS = [
  {
    myth: 'You can\'t get pregnant during your period',
    fact: 'While less likely, pregnancy is still possible during menstruation, especially with irregular cycles.',
    category: 'fertility',
  },
  {
    myth: 'Period blood is dirty',
    fact: 'Period blood is clean and natural. It\'s made up of blood, tissue, and cervical mucus.',
    category: 'hygiene',
  },
  {
    myth: 'You should avoid exercise during your period',
    fact: 'Exercise can actually help reduce cramps and improve mood during menstruation.',
    category: 'lifestyle',
  },
  {
    myth: 'All women have 28-day cycles',
    fact: 'Cycle length varies from 21-35 days and can change throughout your life.',
    category: 'cycle-basics',
  },
];

export default function LearnScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const getPersonalizedArticles = () => {
    if (!userProfile.conditions && !userProfile.symptoms) {
      return ARTICLES.slice(0, 4);
    }

    const relevantTags = [
      ...(userProfile.conditions || []).map(c => c.toLowerCase()),
      ...(userProfile.symptoms || []).map(s => s.toLowerCase()),
    ];

    return ARTICLES.filter(article => 
      article.tags.some(tag => 
        relevantTags.some(relevant => tag.includes(relevant))
      )
    ).slice(0, 4);
  };

  const getFilteredArticles = () => {
    if (!selectedTopic) return ARTICLES;
    return ARTICLES.filter(article => 
      article.category.toLowerCase().includes(selectedTopic.toLowerCase())
    );
  };

  const TopicCard = ({ topic }: { topic: Topic }) => (
    <TouchableOpacity
      style={[styles.topicCard, { borderLeftColor: topic.color }]}
      onPress={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
    >
      <View style={styles.topicHeader}>
        <View style={[styles.topicIcon, { backgroundColor: topic.color }]}>
          <Ionicons name={topic.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.topicInfo}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicDescription}>{topic.description}</Text>
          <Text style={styles.topicCount}>{topic.articleCount} articles</Text>
        </View>
        <Ionicons 
          name={selectedTopic === topic.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666" 
        />
      </View>
    </TouchableOpacity>
  );

  const ArticleCard = ({ article }: { article: Article }) => (
    <TouchableOpacity style={styles.articleCard}>
      <Image source={{ uri: article.image }} style={styles.articleImage} />
      <View style={styles.articleContent}>
        <View style={styles.articleMeta}>
          <Text style={styles.articleCategory}>{article.category}</Text>
          <Text style={styles.articleReadTime}>{article.readTime}</Text>
        </View>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.articleExcerpt} numberOfLines={3}>
          {article.excerpt}
        </Text>
        <View style={styles.articleTags}>
          {article.tags.slice(0, 2).map(tag => (
            <View key={tag} style={styles.articleTag}>
              <Text style={styles.articleTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const MythFactCard = ({ item }: { item: typeof MYTHS_FACTS[0] }) => (
    <View style={styles.mythFactCard}>
      <View style={styles.mythSection}>
        <View style={styles.mythHeader}>
          <Ionicons name="close-circle" size={20} color="#EF4444" />
          <Text style={styles.mythLabel}>MYTH</Text>
        </View>
        <Text style={styles.mythText}>{item.myth}</Text>
      </View>
      <View style={styles.factSection}>
        <View style={styles.factHeader}>
          <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          <Text style={styles.factLabel}>FACT</Text>
        </View>
        <Text style={styles.factText}>{item.fact}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8E53']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Ionicons name="book" size={28} color="#fff" />
          <Text style={styles.headerTitle}>FlowLearn</Text>
          <Text style={styles.headerSubtitle}>Your trusted source for menstrual health</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personalized Section */}
        {userProfile.conditions || userProfile.symptoms ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Personalized for You</Text>
            <Text style={styles.sectionSubtitle}>
              Based on your profile and preferences
            </Text>
            <FlatList
              data={getPersonalizedArticles()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.personalizedList}
              renderItem={({ item }) => <ArticleCard article={item} />}
              keyExtractor={item => item.id}
            />
          </View>
        ) : null}

        {/* Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Explore Topics</Text>
          <Text style={styles.sectionSubtitle}>
            Choose a topic to dive deeper
          </Text>
          {TOPICS.map(topic => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </View>

        {/* Filtered Articles */}
        {selectedTopic && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📖 {TOPICS.find(t => t.id === selectedTopic)?.title} Articles
            </Text>
            {getFilteredArticles().map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        )}

        {/* Featured Articles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ Featured Articles</Text>
          <Text style={styles.sectionSubtitle}>
            Most popular and helpful content
          </Text>
          {ARTICLES.filter(a => a.isFeatured).map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </View>

        {/* Myth vs Fact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Myth vs. Fact</Text>
          <Text style={styles.sectionSubtitle}>
            Debunking common misconceptions
          </Text>
          {MYTHS_FACTS.map((item, index) => (
            <MythFactCard key={index} item={item} />
          ))}
        </View>

        {/* Quiz CTA */}
        <View style={styles.quizSection}>
          <LinearGradient
            colors={['#4ECDC4', '#44A08D']}
            style={styles.quizGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.quizContent}>
              <Ionicons name="help-circle" size={32} color="#fff" />
              <Text style={styles.quizTitle}>Still Have Questions?</Text>
              <Text style={styles.quizSubtitle}>
                Chat with FlowBot for personalized answers
              </Text>
              <TouchableOpacity 
                style={styles.quizButton}
                onPress={() => router.push('/flowbot')}
              >
                <Text style={styles.quizButtonText}>Ask FlowBot</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
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
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  personalizedList: {
    paddingRight: 20,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  topicCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  articleImage: {
    width: '100%',
    height: 160,
  },
  articleContent: {
    padding: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B9D',
    textTransform: 'uppercase',
  },
  articleReadTime: {
    fontSize: 12,
    color: '#999',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 24,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  articleTags: {
    flexDirection: 'row',
    gap: 8,
  },
  articleTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  articleTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  mythFactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mythSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  mythHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  mythLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  mythText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  factSection: {
    padding: 16,
  },
  factHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  factText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  quizSection: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  quizGradient: {
    borderRadius: 20,
    padding: 24,
  },
  quizContent: {
    alignItems: 'center',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  quizSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  quizButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 