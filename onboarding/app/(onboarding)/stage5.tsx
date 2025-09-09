import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function Stage5() {
  const { state } = useOnboarding();
  const [firstMoveText, setFirstMoveText] = useState('');
  const [isExecuted, setIsExecuted] = useState(false);

  useEffect(() => {
    generateFirstMove();
  }, [state.answers]);

  const generateFirstMove = () => {
    let move = `Enough talk, ${state.answers.name || "my counterpart"}. Let's make our first move.`;

    if (state.answers.mission && state.answers.mission.toLowerCase().includes("build")) {
      move += "\n\nWe start by laying the foundation — a 90-day battle plan.";
    } else if (state.answers.dare) {
      move += `\n\nToday, we take the first step toward: ${state.answers.dare}`;
    } else if (state.answers.season && state.answers.season.toLowerCase().includes("transform")) {
      move += "\n\nWe begin by reshaping what no longer serves us.";
    } else {
      move += "\n\nWe begin by mapping our path forward.";
    }

    if (state.answers.decisionStyle && state.answers.decisionStyle.toLowerCase().includes("challenge")) {
      move += "\n\nAnd I will push you — because that's how we win.";
    }

    setFirstMoveText(move);
  };

  const executeFirstMove = () => {
    setFirstMoveText(prev => prev + "\n\n(First move executed!)");
    setIsExecuted(true);
  };

  const handleNext = () => {
    router.push('/(onboarding)/stage6' as any);
  };

  return (
    <OnboardingStage>
      <Text style={styles.title}>Our First Move</Text>
      <Text style={styles.text}>{firstMoveText}</Text>
      {!isExecuted ? (
        <OnboardingButton title="Do It Now" onPress={executeFirstMove} />
      ) : (
        <OnboardingButton title="Continue" onPress={handleNext} />
      )}
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
  text: {
    color: '#f5f5f5',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'SpaceMono',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
});