import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Index() {
  const { state } = useOnboarding();

  useEffect(() => {
    if (state.isComplete) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/stage0' as any);
    }
  }, [state.isComplete]);

  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
});