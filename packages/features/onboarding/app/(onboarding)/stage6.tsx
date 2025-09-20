import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Stage6() {
  const { state, dispatch } = useOnboarding();

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    router.replace('/(tabs)');
  };

  return (
    <OnboardingStage>
      <View style={styles.glyphContainer}>
        <View style={styles.userGlyph} />
        <View style={styles.connector} />
        <View style={styles.sallieGlyph} />
      </View>
      <Text style={styles.text}>
        The Convergence is complete.{'\n'}
        From here on, every step is ours, {state.answers.name || "partner"}.
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