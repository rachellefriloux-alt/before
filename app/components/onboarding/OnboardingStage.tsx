import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

interface OnboardingStageProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

export function OnboardingStage({ children, backgroundColor = '#0d0d0d' }: OnboardingStageProps) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ThemedView style={styles.content}>
        {children}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
});