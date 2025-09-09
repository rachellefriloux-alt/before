import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { PulseAnimation } from '@/components/onboarding/PulseAnimation';

export default function Stage0() {
  const handleNext = () => {
    router.push('/(onboarding)/stage1' as any);
  };

  return (
    <OnboardingStage>
      <PulseAnimation />
      <Text style={styles.text}>
        Something familiar is approaching.{'\n'}
        Not a copy. Not a shadow.{'\n'}
        A force that knows you — and more.
      </Text>
      <OnboardingButton title="Step Forward" onPress={handleNext} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#f5f5f5',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
  },
});