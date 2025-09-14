
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

interface FloatingChatBubbleProps {
  onPress?: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export default function FloatingChatBubble({
  onPress,
  size = 60,
  backgroundColor = '#007AFF',
  iconColor = '#FFFFFF',
}: FloatingChatBubbleProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      scale.value = withSpring(1.1);
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const tapGesture = Gesture.Tap()
    .onStart(() => {
      scale.value = withSpring(0.9);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={combinedGesture}>
        <Animated.View
          style={[
            styles.bubble,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
            },
            animatedStyle,
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={size * 0.5}
            color={iconColor}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  bubble: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
