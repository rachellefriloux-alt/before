import * as Haptics from 'expo-haptics';

// Dynamic imports for navigation components to avoid CommonJS/ESM conflicts
let PlatformPressable: any;

(async () => {
  try {
    const elements = await import('@react-navigation/elements');
    PlatformPressable = elements.PlatformPressable;
  } catch (error) {
    console.warn('Failed to load navigation components:', error);
  }
})();

export function HapticTab(props: any) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: any) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}