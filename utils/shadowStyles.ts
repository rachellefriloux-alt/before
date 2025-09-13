/**
 * Cross-Platform Shadow Utilities
 * Converts React Native shadow properties to work across web and native platforms
 */

import { Platform, ViewStyle } from 'react-native';

export interface ShadowConfig {
  shadowColor: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation?: number;
}

export interface AnimatedShadowConfig {
  shadowColor: string;
  shadowOpacity: any; // Animated.Value or interpolation
  shadowRadius: any;  // Animated.Value or interpolation
  shadowOffset?: { width: number; height: number };
  elevation?: any;    // Animated.Value or interpolation
}

/**
 * Creates cross-platform shadow styles from shadow configuration
 */
export function createShadowStyle(config: ShadowConfig): ViewStyle {
  const {
    shadowColor,
    shadowOffset = { width: 0, height: 2 },
    shadowOpacity,
    shadowRadius,
    elevation = shadowRadius,
  } = config;

  if (Platform.OS === 'web') {
    // Convert to CSS box-shadow for web
    const offsetX = shadowOffset.width;
    const offsetY = shadowOffset.height;
    const blur = shadowRadius;
    
    // Extract RGB values from hex color or use rgba if already formatted
    let shadowColorWithOpacity = shadowColor;
    if (shadowColor.startsWith('#')) {
      // Convert hex to rgba
      const hex = shadowColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      shadowColorWithOpacity = `rgba(${r}, ${g}, ${b}, ${shadowOpacity})`;
    } else if (shadowColor.startsWith('rgba')) {
      // Replace the alpha value with our shadowOpacity
      shadowColorWithOpacity = shadowColor.replace(/[\d\.]+(?=\))/, shadowOpacity.toString());
    }

    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px 0px ${shadowColorWithOpacity}`,
    } as ViewStyle;
  } else {
    // Use native shadow properties for iOS/Android
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation,
    };
  }
}

/**
 * Creates cross-platform shadow styles with animated values
 * For use with Animated.View components
 */
export function createAnimatedShadowStyle(config: AnimatedShadowConfig): any {
  const {
    shadowColor,
    shadowOpacity,
    shadowRadius,
    shadowOffset = { width: 0, height: 2 },
    elevation,
  } = config;

  if (Platform.OS === 'web') {
    // For web, we need to use transform and filter for animations
    // Since boxShadow doesn't animate well with Animated.Value
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: elevation || shadowRadius,
    };
  } else {
    // Use native animated shadow properties
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: elevation || shadowRadius,
    };
  }
}

/**
 * Common shadow presets for consistent design
 */
export const ShadowPresets = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: (color: string = '#14b8a6') => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  }),
};

/**
 * Creates a glowing shadow effect that works cross-platform
 */
export function createGlowEffect(
  color: string,
  intensity: number = 0.5,
  radius: number = 8
): ViewStyle {
  return createShadowStyle({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: radius,
    elevation: radius,
  });
}