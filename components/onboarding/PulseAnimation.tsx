import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
} from 'react-native-reanimated';

interface PulseAnimationProps {
  size?: number;
  color?: string;
  intensity?: 'subtle' | 'normal' | 'intense';
  duration?: number;
}

export function PulseAnimation({
  size = 100,
  color = '#FFD700',
  intensity = 'normal',
  duration = 2000
}: PulseAnimationProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.7);
  const rotation = useSharedValue(0);

  useEffect(() => {
    const intensityConfig = {
      subtle: { scaleRange: [1, 1.1], opacityRange: [0.5, 0.8] },
      normal: { scaleRange: [1, 1.2], opacityRange: [0.4, 0.9] },
      intense: { scaleRange: [1, 1.4], opacityRange: [0.3, 1.0] },
    };

    const config = intensityConfig[intensity];

    // Scale animation
    scale.value = withRepeat(
      withSequence(
        withTiming(config.scaleRange[1], { duration: duration / 2, easing: Easing.out(Easing.ease) }),
        withTiming(config.scaleRange[0], { duration: duration / 2, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    // Opacity animation
    opacity.value = withRepeat(
      withSequence(
        withTiming(config.opacityRange[1], { duration: duration / 2 }),
        withTiming(config.opacityRange[0], { duration: duration / 2 })
      ),
      -1,
      false
    );

    // Subtle rotation for intense mode
    if (intensity === 'intense') {
      rotation.value = withRepeat(
        withTiming(360, { duration: duration * 2 }),
        -1,
        false
      );
    }
  }, [intensity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [1, 1.4], [0.8, 1.2]) }],
    opacity: interpolate(opacity.value, [0.3, 1.0], [0.2, 0.4]),
  }));

  return (
    <View style={styles.container}>
      {/* Outer ring for intense effect */}
      {intensity === 'intense' && (
        <Animated.View
          style={[
            styles.ring,
            { width: size * 1.5, height: size * 1.5, borderColor: color },
            ringStyle
          ]}
        />
      )}

      {/* Main pulse */}
      <Animated.View
        style={[
          styles.pulse,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color
          },
          animatedStyle
        ]}
      />

      {/* Inner glow for normal and intense */}
      {(intensity === 'normal' || intensity === 'intense') && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: size * 0.3,
              backgroundColor: color
            },
            useAnimatedStyle(() => ({
              opacity: interpolate(opacity.value, [0.3, 1.0], [0.6, 0.9]),
              transform: [{ scale: interpolate(scale.value, [1, 1.4], [0.9, 1.1]) }]
            }))
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  pulse: {
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 999,
  },
  glow: {
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
});