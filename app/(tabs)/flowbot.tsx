import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  age?: string;
  conditions?: string[];
  symptoms?: string[];
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  citations?: Array<{ title: string; url: string; description: string }>;
}

// Enhanced knowledge base
const KNOWLEDGE = [
  {
    pattern: /(period|menstrual|cycle|monthly)/i,
    response: "Your menstrual cycle is a natural process that typically lasts 21-35 days. The average cycle is 28 days, but variations are completely normal. Your cycle includes menstruation (period), follicular phase, ovulation, and luteal phase.",
    citations: [
      { title: "ACOG - Menstruation", url: "https://www.acog.org", description: "American College of Obstetricians and Gynecologists guidelines" }
    ]
  },
  {
    pattern: /(pcos|polycystic)/i,
    response: "PCOS (Polycystic Ovary Syndrome) is a hormonal disorder affecting 1 in 10 women. Common symptoms include irregular periods, excess hair growth, acne, and weight gain. Treatment focuses on managing symptoms through lifestyle changes, medication, and sometimes birth control.",
    citations: [
      { title: "WHO - PCOS Information", url: "https://www.who.int", description: "World Health Organization guidelines" }
    ]
  },
  {
    pattern: /(cramps|pain|dysmenorrhea)/i,
    response: "Menstrual cramps are common and can be managed with over-the-counter pain relievers, heating pads, gentle exercise, and relaxation techniques. If cramps are severe or interfere with daily activities, consult a healthcare provider.",
    citations: [
      { title: "Mayo Clinic - Menstrual Cramps", url: "https://www.mayoclinic.org", description: "Medical information on dysmenorrhea" }
    ]
  },
  {
    pattern: /(tampon|pad|menstrual cup)/i,
    response: "There are several menstrual product options: Pads are external and good for beginners, tampons are internal and convenient for active lifestyles, and menstrual cups are reusable and eco-friendly. Choose what feels most comfortable for you.",
    citations: [
      { title: "FDA - Menstrual Products", url: "https://www.fda.gov", description: "Safety information on menstrual products" }
    ]
  },
  {
    pattern: /(irregular|missed|late period)/i,
    response: "Irregular periods can be caused by stress, weight changes, exercise, medications, or underlying health conditions. If you're concerned about irregular cycles, track your symptoms and consult a healthcare provider.",
    citations: [
      { title: "ACOG - Irregular Periods", url: "https://www.acog.org", description: "Clinical guidance on menstrual irregularities" }
    ]
  },
  {
    pattern: /(pms|premenstrual)/i,
    response: "PMS (Premenstrual Syndrome) affects up to 75% of women. Symptoms include mood changes, bloating, breast tenderness, and food cravings. Managing stress, regular exercise, and a balanced diet can help reduce symptoms.",
    citations: [
      { title: "NIH - PMS Information", url: "https://www.nichd.nih.gov", description: "National Institute of Health research" }
    ]
  }
];

export default function FlowBotScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    loadUserProfile();
    // Add welcome message
    setMessages([{
      id: '1',
      text: "Hi! I'm FlowBot, your menstrual health companion. I'm here to answer your questions about periods, reproductive health, and wellness. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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

  const generateBotReply = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for urgent symptoms
    if (lowerMessage.includes('heavy bleeding') || lowerMessage.includes('severe pain') || lowerMessage.includes('fever')) {
      return "⚠️ This could be a medical emergency. Please contact a healthcare provider immediately or go to the nearest emergency room.";
    }

    // Check for symptom patterns
    if (lowerMessage.includes('cramps') && lowerMessage.includes('bloating')) {
      return "Cramps and bloating together are common PMS symptoms. Try gentle exercise, heating pads, and over-the-counter pain relievers. If symptoms are severe, consult your healthcare provider.";
    }

    // Use knowledge base
    for (const item of KNOWLEDGE) {
      if (item.pattern.test(userMessage)) {
        return item.response;
      }
    }

    // Default response
    return "I'm here to help with menstrual health questions! You can ask me about periods, products, symptoms, or general wellness. For specific medical advice, always consult a healthcare provider.";
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botReply = generateBotReply(inputText.trim());
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter' && !nativeEvent.shiftKey) {
      handleSendMessage();
    }
  };

  const MessageBubble = ({ message }: { message: Message }) => (
    <View style={[
      styles.messageBubble,
      message.isUser ? styles.userMessage : styles.botMessage,
      message.isUser ? styles.userMessageLast : styles.botMessageLast
    ]}>
      <View style={styles.messageHeader}>
        <Text style={styles.senderText}>
          {message.isUser ? 'You' : 'FlowBot'}
        </Text>
        <Text style={styles.timestampText}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      <Text style={styles.messageText}>{message.text}</Text>
      
      {message.citations && message.citations.length > 0 && (
        <View style={styles.citationsContainer}>
          {message.citations.map((citation, index) => (
            <TouchableOpacity
              key={index}
              style={styles.citationButton}
              onPress={() => Alert.alert(citation.title, citation.description)}
            >
              <Text style={styles.citationText}>📚 {citation.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#FF8E53']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.botAvatar}>
            <Ionicons name="medical" size={24} color="#FF6B9D" />
          </View>
          <Text style={styles.headerTitle}>FlowBot</Text>
          <Text style={styles.headerSubtitle}>Your AI Health Companion</Text>
        </View>
      </LinearGradient>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={flatListRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isTyping && (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color="#FF6B9D" />
              <Text style={styles.typingText}>FlowBot is typing...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask me anything about menstrual health..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onKeyPress={handleKeyPress}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#FF6B9D', '#FF8E53'] : ['#E5E7EB', '#D1D5DB']}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={inputText.trim() ? "#fff" : "#9CA3AF"} 
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputHint}>
            Press Enter to send • Shift+Enter for new line
          </Text>
        </View>
      </KeyboardAvoidingView>
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
  botAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '85%',
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF6B9D',
    borderBottomRightRadius: 4,
  },
  userMessageLast: {
    borderBottomRightRadius: 20,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  botMessageLast: {
    borderBottomLeftRadius: 20,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  timestampText: {
    fontSize: 11,
    color: '#999',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1A1A1A',
  },
  citationsContainer: {
    marginTop: 12,
    gap: 8,
  },
  citationButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  citationText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 8,
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
