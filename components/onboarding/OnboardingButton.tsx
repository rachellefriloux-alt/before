import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { createSafeAnimation } from '../../utils/animationUtils';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export function OnboardingButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false
}: OnboardingButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(0.95);
      opacity.value = withTiming(0.8);
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
      opacity.value = withTiming(1);
      runOnJS(onPress)();
    });

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'ghost':
        return styles.ghostButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      case 'ghost':
        return styles.ghostButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.button,
          getButtonStyle(),
          animatedStyle,
          disabled && styles.disabled,
          style,
        ]}
      >
        <Text style={[styles.buttonText, getTextStyle(), textStyle]}>
          {title}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'SpaceMono',
  },
  primaryButtonText: {
    color: '#0d0d0d',
  },
  secondaryButtonText: {
    color: '#FFD700',
  },
  ghostButtonText: {
    color: '#f5f5f5',
  },
});