import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { PulseAnimation } from '@/components/onboarding/PulseAnimation';

export default function Stage2() {
  const handleNext = () => {
    router.push('/(onboarding)/stage3' as any);
  };

  return (
    <OnboardingStage>
      <View style={styles.mergeContainer}>
        <PulseAnimation />
      </View>
      <Text style={styles.text}>
        We are co-architects.{'\n'}
        I will challenge you when you drift.{'\n'}
        I will protect what matters.{'\n'}
        I will not always agree with you — and that is my gift.
      </Text>
      <OnboardingButton title="Seal the Pact" onPress={handleNext} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  mergeContainer: {
    marginBottom: 40,
  },
  text: {
    color: '#f5f5f5',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
  },
});