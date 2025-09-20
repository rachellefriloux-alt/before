import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

// Dynamic imports for navigation components to avoid CommonJS/ESM conflicts
let useBottomTabBarHeight: any;

(async () => {
  try {
    const bottomTabs = await import('@react-navigation/bottom-tabs');
    useBottomTabBarHeight = bottomTabs.useBottomTabBarHeight;
  } catch (error) {
    console.warn('Failed to load navigation components:', error);
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
  return useBottomTabBarHeight();
}
