import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

interface LogEntry {
  date: string;
  flow: 'spotting' | 'light' | 'medium' | 'heavy' | 'flooding';
  symptoms: string[];
  mood: string;
  energy: string;
  sleep: string;
  focus: string;
  lifestyle: string[];
  notes: string;
}

const MOODS = ['Happy', 'Calm', 'Anxious', 'Irritable', 'Sad', 'Energetic', 'Tired'];
const SLEEP_QUALITY = ['Excellent', 'Good', 'Fair', 'Poor'];
const FOCUS_LEVELS = ['Very Focused', 'Focused', 'Distracted', 'Very Distracted'];
const LIFESTYLE = ['Exercise', 'Sexual Activity', 'Medication', 'Stress', 'Travel'];

export default function TrackerScreen() {
  const [logs, setLogs] = useState<{ [key: string]: LogEntry }>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLog, setCurrentLog] = useState<Partial<LogEntry>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const savedLogs = await AsyncStorage.getItem('cycleLogs');
      if (savedLogs) {
        setLogs(JSON.parse(savedLogs));
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveLogs = async (newLogs: { [key: string]: LogEntry }) => {
    try {
      await AsyncStorage.setItem('cycleLogs', JSON.stringify(newLogs));
    } catch (error) {
      console.error('Failed to save logs:', error);
    }
  };

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
    setCurrentLog(logs[date] || {});
    setModalVisible(true);
  };

  const handleSaveLog = async () => {
    if (!currentLog.flow) {
      Alert.alert('Missing Information', 'Please select your flow intensity.');
      return;
    }

    const newLogs = { ...logs };
    newLogs[selectedDate] = currentLog as LogEntry;
    
    setLogs(newLogs);
    await saveLogs(newLogs);
    setModalVisible(false);
    setCurrentLog({});
    
    Alert.alert('Success', 'Your log has been saved!');
  };

  const getPredictions = () => {
    // Simple prediction logic - in a real app, this would use ML
    const today = new Date();
    const nextPeriod = new Date(today);
    nextPeriod.setDate(today.getDate() + 28); // Assume 28-day cycle
    
    return {
      nextPeriod: nextPeriod.toISOString().split('T')[0],
      ovulation: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  };

  const getInsights = () => {
    const logEntries = Object.values(logs);
    const cycleLengths: number[] = [];
    let previousPeriodStart: string | null = null;

    // Calculate cycle lengths
    Object.keys(logs).sort().forEach(date => {
      if (logs[date].flow === 'medium' || logs[date].flow === 'heavy') {
        if (previousPeriodStart) {
          const days = Math.floor((new Date(date).getTime() - new Date(previousPeriodStart).getTime()) / (1000 * 60 * 60 * 24));
          if (days > 20 && days < 40) { // Reasonable cycle range
            cycleLengths.push(days);
          }
        }
        previousPeriodStart = date;
      }
    });

    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;

    return {
      avgCycleLength,
      trackedPeriods: logEntries.filter(log => log.flow === 'medium' || log.flow === 'heavy').length,
      nextPredictedPeriod: getPredictions().nextPeriod,
    };
  };

  const renderDay = (day: any) => {
    const date = day.dateString;
    const log = logs[date];
    
    let backgroundColor = 'transparent';
    let textColor = '#1A1A1A';
    
    if (log) {
      if (log.flow === 'heavy' || log.flow === 'flooding') {
        backgroundColor = '#FF6B9D';
        textColor = '#fff';
      } else if (log.flow === 'medium') {
        backgroundColor = '#FFB3D1';
        textColor = '#1A1A1A';
      } else if (log.flow === 'light') {
        backgroundColor = '#FFE6F0';
        textColor = '#1A1A1A';
      } else if (log.flow === 'spotting') {
        backgroundColor = '#FFF0F5';
        textColor = '#1A1A1A';
      }
    }

    return (
      <TouchableOpacity
        style={[styles.dayContainer, { backgroundColor }]}
        onPress={() => handleDatePress(date)}
      >
        <Text style={[styles.dayText, { color: textColor }]}>{day.day}</Text>
      </TouchableOpacity>
    );
  };

  const LoggingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log for {selectedDate}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {/* Flow Intensity */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="water" size={16} color="#FF6B9D" /> Flow Intensity
              </Text>
              <View style={styles.optionsContainer}>
                {['spotting', 'light', 'medium', 'heavy', 'flooding'].map((flow) => (
                  <TouchableOpacity
                    key={flow}
                    style={[
                      styles.optionButton,
                      currentLog.flow === flow && styles.optionButtonSelected
                    ]}
                    onPress={() => setCurrentLog({ ...currentLog, flow: flow as any })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.flow === flow && styles.optionButtonTextSelected
                    ]}>
                      {flow.charAt(0).toUpperCase() + flow.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Physical Symptoms */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="body" size={16} color="#4ECDC4" /> Physical Symptoms
              </Text>
              <View style={styles.optionsContainer}>
                {['Cramps', 'Bloating', 'Headache', 'Breast Tenderness', 'Acne', 'Fatigue'].map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[
                      styles.optionButton,
                      currentLog.symptoms?.includes(symptom) && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      const symptoms = currentLog.symptoms || [];
                      const newSymptoms = symptoms.includes(symptom)
                        ? symptoms.filter(s => s !== symptom)
                        : [...symptoms, symptom];
                      setCurrentLog({ ...currentLog, symptoms: newSymptoms });
                    }}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.symptoms?.includes(symptom) && styles.optionButtonTextSelected
                    ]}>
                      {symptom}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mood */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="heart" size={16} color="#A78BFA" /> Mood
              </Text>
              <View style={styles.optionsContainer}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[
                      styles.optionButton,
                      currentLog.mood === mood && styles.optionButtonSelected
                    ]}
                    onPress={() => setCurrentLog({ ...currentLog, mood })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.mood === mood && styles.optionButtonTextSelected
                    ]}>
                      {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Energy Level */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="flash" size={16} color="#F59E0B" /> Energy Level
              </Text>
              <View style={styles.optionsContainer}>
                {['Very Low', 'Low', 'Normal', 'High', 'Very High'].map((energy) => (
                  <TouchableOpacity
                    key={energy}
                    style={[
                      styles.optionButton,
                      currentLog.energy === energy && styles.optionButtonSelected
                    ]}
                    onPress={() => setCurrentLog({ ...currentLog, energy })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.energy === energy && styles.optionButtonTextSelected
                    ]}>
                      {energy}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sleep Quality */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="moon" size={16} color="#10B981" /> Sleep Quality
              </Text>
              <View style={styles.optionsContainer}>
                {SLEEP_QUALITY.map((sleep) => (
                  <TouchableOpacity
                    key={sleep}
                    style={[
                      styles.optionButton,
                      currentLog.sleep === sleep && styles.optionButtonSelected
                    ]}
                    onPress={() => setCurrentLog({ ...currentLog, sleep })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.sleep === sleep && styles.optionButtonTextSelected
                    ]}>
                      {sleep}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Focus Level */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="eye" size={16} color="#EF4444" /> Focus Level
              </Text>
              <View style={styles.optionsContainer}>
                {FOCUS_LEVELS.map((focus) => (
                  <TouchableOpacity
                    key={focus}
                    style={[
                      styles.optionButton,
                      currentLog.focus === focus && styles.optionButtonSelected
                    ]}
                    onPress={() => setCurrentLog({ ...currentLog, focus })}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.focus === focus && styles.optionButtonTextSelected
                    ]}>
                      {focus}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Lifestyle Factors */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="fitness" size={16} color="#8B5CF6" /> Lifestyle Factors
              </Text>
              <View style={styles.optionsContainer}>
                {LIFESTYLE.map((factor) => (
                  <TouchableOpacity
                    key={factor}
                    style={[
                      styles.optionButton,
                      currentLog.lifestyle?.includes(factor) && styles.optionButtonSelected
                    ]}
                    onPress={() => {
                      const lifestyle = currentLog.lifestyle || [];
                      const newLifestyle = lifestyle.includes(factor)
                        ? lifestyle.filter(l => l !== factor)
                        : [...lifestyle, factor];
                      setCurrentLog({ ...currentLog, lifestyle: newLifestyle });
                    }}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      currentLog.lifestyle?.includes(factor) && styles.optionButtonTextSelected
                    ]}>
                      {factor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.loggingSection}>
              <Text style={styles.sectionTitle}>
                <Ionicons name="create" size={16} color="#06B6D4" /> Notes
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any additional notes..."
                placeholderTextColor="#999"
                value={currentLog.notes}
                onChangeText={(text) => setCurrentLog({ ...currentLog, notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveLog}
          >
            <LinearGradient
              colors={['#FF6B9D', '#FF8E53']}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveButtonText}>Save Log</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your cycle data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const insights = getInsights();
  const predictions = getPredictions();

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
          <Ionicons name="calendar" size={28} color="#fff" />
          <Text style={styles.headerTitle}>Cycle Tracker</Text>
          <Text style={styles.headerSubtitle}>Track your symptoms and patterns</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Your Cycle Insights</Text>
          <View style={styles.insightsGrid}>
            <View style={styles.insightCard}>
              <Ionicons name="information-circle" size={24} color="#FF6B9D" />
              <Text style={styles.insightValue}>{insights.avgCycleLength}</Text>
              <Text style={styles.insightLabel}>Avg Cycle Length</Text>
            </View>
            <View style={styles.insightCard}>
              <Ionicons name="calendar" size={24} color="#4ECDC4" />
              <Text style={styles.insightValue}>{insights.trackedPeriods}</Text>
              <Text style={styles.insightLabel}>Tracked Periods</Text>
            </View>
            <View style={styles.insightCard}>
              <Ionicons name="time" size={24} color="#A78BFA" />
              <Text style={styles.insightValue}>
                {new Date(insights.nextPredictedPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.insightLabel}>Next Predicted</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => handleDatePress(day.dateString)}
            renderDay={renderDay}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#1A1A1A',
              selectedDayBackgroundColor: '#FF6B9D',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#FF6B9D',
              dayTextColor: '#1A1A1A',
              textDisabledColor: '#d9e1e8',
              dotColor: '#FF6B9D',
              selectedDotColor: '#ffffff',
              arrowColor: '#FF6B9D',
              monthTextColor: '#1A1A1A',
              indicatorColor: '#FF6B9D',
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 13,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Predictions */}
        <View style={styles.predictionsContainer}>
          <Text style={styles.predictionsTitle}>Predictions</Text>
          <View style={styles.predictionRow}>
            <View style={styles.predictionItem}>
              <View style={[styles.predictionDot, { backgroundColor: '#FF6B9D' }]} />
              <Text style={styles.predictionText}>
                Next Period: {new Date(predictions.nextPeriod).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.predictionItem}>
              <View style={[styles.predictionDot, { backgroundColor: '#4ECDC4' }]} />
              <Text style={styles.predictionText}>
                Ovulation: {new Date(predictions.ovulation).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <LoggingModal />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  insightsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightCard: {
    alignItems: 'center',
    flex: 1,
  },
  insightValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6B9D',
    marginTop: 8,
    marginBottom: 4,
  },
  insightLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  calendarContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  calendar: {
    borderWidth: 0,
  },
  dayContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  predictionsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  predictionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  predictionRow: {
    gap: 16,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  predictionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  predictionText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    padding: 20,
  },
  loggingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#FF6B9D',
    borderColor: '#FF6B9D',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
  },
  optionButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    textAlignVertical: 'top',
  },
  saveButton: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
