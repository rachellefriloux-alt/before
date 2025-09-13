import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { ColorValue } from 'react-native';
import { useThemeStore } from '../../store/theme';
import { usePersonaStore } from '../../store/persona';

const { width } = Dimensions.get('window');

interface EnhancedSallieAvatarProps {
  size?: number;
  animated?: boolean;
  interactive?: boolean;
  showEmotionRing?: boolean;
  showPulse?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}

export default function EnhancedSallieAvatar({
  size = 80,
  animated = true,
  interactive = true,
  showEmotionRing = true,
  showPulse = false,
  onPress,
  onLongPress,
}: EnhancedSallieAvatarProps) {
  const { currentTheme } = useThemeStore();
  const { emotion, intensity, valence, arousal } = usePersonaStore();
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Continuous pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation based on emotional intensity
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnimation, {
            toValue: intensity,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated, intensity]);

  const getEmotionGradient = () => {
    const baseGradient = currentTheme.gradients.sallie;
    
    switch (emotion) {
      case 'happy':
        return ['#FFD700', '#FFA500', '#FF8C00'] as const;
      case 'sad':
        return ['#87CEEB', '#4682B4', '#1E90FF'] as const;
      case 'angry':
        return ['#FF4500', '#DC143C', '#B22222'] as const;
      case 'calm':
        return ['#98FB98', '#32CD32', '#228B22'] as const;
      case 'excited':
        return ['#FF69B4', '#FF1493', '#DC143C'] as const;
      case 'thoughtful':
        return ['#DDA0DD', '#9370DB', '#8A2BE2'] as const;
      case 'concerned':
        return ['#F0E68C', '#DAA520', '#B8860B'] as const;
      default:
        return (baseGradient.length > 0 ? baseGradient : ['#E6E6FA', '#9370DB']) as readonly ColorValue[];
    }
  };

  const getEmotionEmoji = () => {
    const intensityModifier = intensity > 0.7 ? '✨' : '';
    
    switch (emotion) {
      case 'happy':
        return '😊' + intensityModifier;
      case 'sad':
        return '😔' + (intensity > 0.7 ? '💧' : '');
      case 'angry':
        return '😠' + (intensity > 0.7 ? '🔥' : '');
      case 'calm':
        return '😌' + intensityModifier;
      case 'excited':
        return '🤩' + (intensity > 0.7 ? '⚡' : '');
      case 'thoughtful':
        return '🤔' + (intensity > 0.7 ? '💭' : '');
      case 'concerned':
        return '😟' + (intensity > 0.7 ? '❗' : '');
      default:
        return '😐';
    }
  };

  const handlePress = () => {
    if (interactive && onPress) {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      onPress();
    }
  };

  const handleLongPress = () => {
    if (interactive && onLongPress) {
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
      
      onLongPress();
    }
  };

  const gradientColors = getEmotionGradient();
  const emoji = getEmotionEmoji();

  const avatarComponent = (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          transform: [
            { scale: showPulse ? pulseAnimation : scaleAnimation },
          ],
        },
      ]}
    >
      {/* Emotion Ring */}
      {showEmotionRing && (
        <Animated.View
          style={[
            styles.emotionRing,
            {
              width: size + 12,
              height: size + 12,
              borderRadius: (size + 12) / 2,
              borderColor: gradientColors[1],
              opacity: glowAnimation,
            },
          ]}
        />
      )}
      
      {/* Main Avatar */}
      <LinearGradient
        colors={gradientColors as any}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.emojiContainer}>
          <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
            {emoji}
          </Text>
        </View>
        
        {/* Inner glow effect */}
        <Animated.View
          style={[
            styles.innerGlow,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
              opacity: glowAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      </LinearGradient>
      
      {/* Status indicators */}
      <View style={[styles.statusContainer, { bottom: size * 0.1 }]}>
        <View style={[styles.statusDot, { backgroundColor: gradientColors[0] }]} />
        <View style={[styles.statusDot, { backgroundColor: gradientColors[1] }]} />
        <View style={[styles.statusDot, { backgroundColor: gradientColors[2] }]} />
      </View>
    </Animated.View>
  );

  if (interactive) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {avatarComponent}
      </TouchableOpacity>
    );
  }

  return avatarComponent;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  emoji: {
    textAlign: 'center',
  },
  emotionRing: {
    position: 'absolute',
    borderWidth: 3,
    zIndex: 0,
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  statusContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
});