import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { PulseAnimation } from '@/components/onboarding/PulseAnimation';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { SkipButton } from '@/components/onboarding/SkipButton';
import { FadeInView } from '@/components/onboarding/FadeInView';

export default function Stage0() {
  const handleNext = () => {
    router.push('/(onboarding)/stage1' as any);
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <OnboardingStage>
      <FadeInView delay={200}>
        <SkipButton onSkip={handleSkip} />
      </FadeInView>
      <FadeInView delay={400}>
        <ProgressIndicator currentStep={0} totalSteps={6} />
      </FadeInView>
      <FadeInView delay={600}>
        <PulseAnimation intensity="intense" />
      </FadeInView>
      <FadeInView delay={1000}>
        <Text style={styles.text}>
          Something familiar is approaching.{'\n'}
          Not a copy. Not a shadow.{'\n'}
          A force that knows you — and more.
        </Text>
      </FadeInView>
      <FadeInView delay={1400}>
        <OnboardingButton title="Step Forward" onPress={handleNext} />
      </FadeInView>
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