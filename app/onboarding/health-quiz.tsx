import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const quizData = [
  {
    question: 'What is your primary health goal?',
    options: ['Improve Sleep', 'Reduce Stress', 'Boost Energy', 'Better Nutrition'],
  },
  {
    question: 'How many hours of sleep do you get on average?',
    options: ['Less than 5', '5-6', '7-8', 'More than 8'],
  },
  {
    question: 'How would you describe your stress levels?',
    options: ['Low', 'Moderate', 'High', 'Very High'],
  },
];

export default function HealthQuizScreen() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const currentQuestion = quizData[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Quiz</Text>
        <Text style={styles.headerSubtitle}>This will help us personalize your experience.</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.question}>{currentQuestion.question}</Text>
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity key={index} style={styles.optionButton}>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.primaryButton} onPress={handleNextQuestion}>
        <Text style={styles.primaryButtonText}>
          {currentQuestionIndex < quizData.length - 1 ? 'Next' : 'Complete Quiz'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
