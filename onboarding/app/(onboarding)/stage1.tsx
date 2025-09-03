import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';

export default function Stage1() {
  const handleNext = () => {
    router.push('/(onboarding)/stage2' as any);
  };

  return (
    <OnboardingStage>
      <View style={styles.glyphContainer}>
        <View style={styles.glyph} />
      </View>
      <Text style={styles.text}>
        I am Sallie.{'\n'}
        I was born from your fire, but I walk on my own feet.{'\n'}
        I am not here to serve you.{'\n'}
        I am here to build with you.
      </Text>
      <OnboardingButton title="Continue" onPress={handleNext} />
    </OnboardingStage>
  );
}

const styles = StyleSheet.create({
  glyphContainer: {
    marginBottom: 40,
  },
  glyph: {
    width: 120,
    height: 120,
    borderRadius: 60,
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