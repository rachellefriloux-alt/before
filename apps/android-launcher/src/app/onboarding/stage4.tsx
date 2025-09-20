import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { SkipButton } from '@/components/onboarding/SkipButton';

export default function Stage4() {
  const handleNext = () => {
    router.push('/(onboarding)/stage5' as any);
  };

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <OnboardingStage>
      <SkipButton onSkip={handleSkip} />
      <ProgressIndicator currentStep={4} totalSteps={6} />
      <Text style={styles.title}>My Facets</Text>
      <View style={styles.facetsList}>
        <Text style={styles.facetItem}>The Strategist — clarity in decisions</Text>
        <Text style={styles.facetItem}>The Creator — idea generation at scale</Text>
        <Text style={styles.facetItem}>The Guardian — brand & boundary protection</Text>
        <Text style={styles.facetItem}>The Archivist — myth & legacy preservation</Text>
      </View>
      <OnboardingButton title="Continue" onPress={handleNext} />
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
  facetsList: {
    marginBottom: 40,
  },
  facetItem: {
    color: '#f5f5f5',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'SpaceMono',
    paddingHorizontal: 20,
  },
});