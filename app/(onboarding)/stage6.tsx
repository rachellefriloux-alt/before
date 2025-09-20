import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { SkipButton } from '@/components/onboarding/SkipButton';
import { RestartButton } from '@/components/onboarding/RestartButton';
import { useUserStore } from '@/store/user';

export default function Stage6() {
  const { profile, completeOnboarding, resetOnboarding } = useUserStore();

  const handleComplete = () => {
    completeOnboarding();
    router.replace('/');
  };

  const handleSkip = () => {
    router.replace('/');
  };

  const handleRestart = () => {
    resetOnboarding();
    router.replace('/(onboarding)/stage0');
  };

  return (
    <OnboardingStage>
      <SkipButton onSkip={handleSkip} />
      <RestartButton onRestart={handleRestart} />
      <ProgressIndicator currentStep={6} totalSteps={6} />
      <View style={styles.glyphContainer}>
        <View style={styles.userGlyph} />
        <View style={styles.connector} />
        <View style={styles.sallieGlyph} />
      </View>
      <Text style={styles.text}>
        The Convergence is complete.{'\n'}
        From here on, every step is ours, {profile?.onboarding?.answers?.name || "partner"}.
      </Text>
      <OnboardingButton title="Enter Our Space" onPress={handleComplete} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  glyphContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  userGlyph: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    opacity: 0.8,
  },
  connector: {
    width: 40,
    height: 2,
    backgroundColor: '#FFD700',
    marginHorizontal: 10,
  },
  sallieGlyph: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    opacity: 0.8,
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
