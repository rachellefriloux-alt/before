import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { OnboardingButton } from './OnboardingButton';
import { useOnboarding, QAAnswer } from '@/contexts/OnboardingContext';

const qaQuestions = [
  { q: "What name should I call you in our space?", key: "name" as keyof QAAnswer },
  { q: "Do you have a title or role you want me to honor?", key: "title" as keyof QAAnswer },
  { q: "Where in the world do you call home?", key: "location" as keyof QAAnswer },
  { q: "What's your current season of life — building, maintaining, or transforming?", key: "season" as keyof QAAnswer },
  { q: "What is the heartbeat of our mission?", key: "mission" as keyof QAAnswer },
  { q: "When we face a fork in the road, do you want me to follow your instinct or challenge it?", key: "decisionStyle" as keyof QAAnswer },
  { q: "What's one thing you've always wanted to do but haven't dared?", key: "dare" as keyof QAAnswer },
  { q: "What symbols, colors, and words feel like home to you?", key: "aesthetics" as keyof QAAnswer },
  { q: "What's your ideal rhythm — and how do you want me to sync with it?", key: "rhythm" as keyof QAAnswer },
  { q: "What's the one thing I must never compromise?", key: "nonnegotiable" as keyof QAAnswer }
];

interface QASystemProps {
  onComplete: () => void;
}

export function QASystem({ onComplete }: QASystemProps) {
  const { state, dispatch } = useOnboarding();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleNext = () => {
    if (currentAnswer.trim()) {
      dispatch({
        type: 'SET_ANSWER',
        key: qaQuestions[currentQuestionIndex].key,
        value: currentAnswer.trim(),
      });
    }

    if (currentQuestionIndex < qaQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      onComplete();
    }
  };

  const currentQuestion = qaQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{currentQuestion.q}</Text>
      <TextInput
        style={styles.input}
        value={currentAnswer}
        onChangeText={setCurrentAnswer}
        placeholder="Type your answer..."
        placeholderTextColor="#888"
        multiline
      />
      <OnboardingButton 
        title={currentQuestionIndex < qaQuestions.length - 1 ? "Next" : "Complete"} 
        onPress={handleNext} 
      />
      <Text style={styles.progressText}>
        {currentQuestionIndex + 1} of {qaQuestions.length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    color: '#f5f5f5',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'SpaceMono',
  },
  input: {
    backgroundColor: '#333',
    color: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    minHeight: 80,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  progressText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
});