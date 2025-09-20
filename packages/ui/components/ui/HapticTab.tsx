import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable } from 'react-native';

export function HapticTab(props: any) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: any) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when the user presses the tab on the native side.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}