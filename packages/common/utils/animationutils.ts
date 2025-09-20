
import { withTiming, withSpring, WithTimingConfig, WithSpringConfig } from 'react-native-reanimated';

export interface SafeAnimationConfig {
  useNativeDriver?: boolean;
  duration?: number;
  easing?: (value: number) => number;
}

export const createSafeAnimation = {
  timing: (
    toValue: number,
    config: WithTimingConfig & SafeAnimationConfig = {}
  ) => {
    // Remove useNativeDriver from config as Reanimated 3 handles this automatically
    const { useNativeDriver, ...reanimatedConfig } = config;
    return withTiming(toValue, reanimatedConfig);
  },

  spring: (
    toValue: number,
    config: WithSpringConfig & SafeAnimationConfig = {}
  ) => {
    // Remove useNativeDriver from config as Reanimated 3 handles this automatically
    const { useNativeDriver, ...reanimatedConfig } = config;
    return withSpring(toValue, reanimatedConfig);
  }
};

export const animationDefaults = {
  timing: {
    duration: 300,
  },
  spring: {
    damping: 15,
    stiffness: 100,
  }
} as const;
