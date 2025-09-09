import React, { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { OnboardingStage } from '@/components/onboarding/OnboardingStage';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { ProgressIndicator } from '@/components/onboarding/ProgressIndicator';
import { SkipButton } from '@/components/onboarding/SkipButton';
import { useUserStore } from '@/app/store/user';

export default function Stage5() {
  const { profile } = useUserStore();
  const [firstMoveText, setFirstMoveText] = useState('');
  const [isExecuted, setIsExecuted] = useState(false);

  useEffect(() => {
    generateFirstMove();
  }, [profile?.onboarding?.answers]);

  const generateFirstMove = () => {
    const answers = profile?.onboarding?.answers || {};
    let move = `Enough talk, ${answers.name || "my counterpart"}. Let's make our first move.`;

    if (answers.mission && answers.mission.toLowerCase().includes("build")) {
      move += "\n\nWe start by laying the foundation — a 90-day battle plan.";
    } else if (answers.dare) {
      move += `\n\nToday, we take the first step toward: ${answers.dare}`;
    } else if (answers.season && answers.season.toLowerCase().includes("transform")) {
      move += "\n\nWe begin by reshaping what no longer serves us.";
    } else {
      move += "\n\nWe begin by mapping our path forward.";
    }

    if (answers.decisionStyle && answers.decisionStyle.toLowerCase().includes("challenge")) {
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

  const handleSkip = () => {
    router.replace('/');
  };

  return (
    <OnboardingStage>
      <SkipButton onSkip={handleSkip} />
      <ProgressIndicator currentStep={5} totalSteps={6} />
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