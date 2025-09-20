import React from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SallieAvatarProps {
  emotion: string;
  size: number;
  animated?: boolean;
}

export default function SallieAvatar({ emotion, size, animated = true }: SallieAvatarProps) {
  const getEmotionColors = () => {
    switch (emotion) {
      case 'happy':
        return ['#FFD700', '#FFA500'] as const;
      case 'sad':
        return ['#87CEEB', '#4682B4'] as const;
      case 'angry':
        return ['#FF4500', '#DC143C'] as const;
      case 'calm':
        return ['#98FB98', '#32CD32'] as const;
      case 'excited':
        return ['#FF69B4', '#FF1493'] as const;
      case 'thoughtful':
        return ['#DDA0DD', '#9370DB'] as const;
      case 'concerned':
        return ['#F0E68C', '#DAA520'] as const;
      default:
        return ['#E6E6FA', '#9370DB'] as const;
    }
  };

  const getEmotionEmoji = () => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😔';
      case 'angry':
        return '😠';
      case 'calm':
        return '😌';
      case 'excited':
        return '🤩';
      case 'thoughtful':
        return '🤔';
      case 'concerned':
        return '😟';
      default:
        return '😐';
    }
  };

  const colors = getEmotionColors();
  const emoji = getEmotionEmoji();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={colors}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.emojiContainer}>
          <Text style={[styles.emoji, { fontSize: size * 0.4 }]}>
            {emoji}
          </Text>
        </View>
      </LinearGradient>
      
      {/* Emotion indicator ring */}
      <View 
        style={[
          styles.emotionRing, 
          { 
            width: size + 8, 
            height: size + 8, 
            borderRadius: (size + 8) / 2,
            borderColor: colors[1]
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  emotionRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.6,
  },
});
