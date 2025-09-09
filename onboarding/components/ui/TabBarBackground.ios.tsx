import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

// Dynamic import for navigation hook to avoid CommonJS/ESM conflicts
let useBottomTabBarHeight: any;

(async () => {
  try {
    const { useBottomTabBarHeight: hook } = await import('@react-navigation/bottom-tabs');
    useBottomTabBarHeight = hook;
  } catch (error) {
    console.warn('Failed to load navigation hook:', error);
  }
})();

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // System chrome material automatically adapts to the system's theme
      // and matches the native tab bar appearance on iOS.
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight?.() || 0;
}
