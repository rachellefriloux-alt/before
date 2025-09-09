import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { QASystem } from '@/components/onboarding/QASystem';

export default function Stage3() {
  const handleComplete = () => {
    router.push('/(onboarding)/stage4' as any);
  };

  return (
    <OnboardingStage>
      <Text style={styles.title}>The Calibration</Text>
      <QASystem onComplete={handleComplete} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#f5f5f5',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'SpaceMono',
  },
});