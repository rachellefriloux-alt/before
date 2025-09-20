
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface MoodState {
  name: string;
  intensity: number;
  color: string;
  emoji: string;
}

interface SallieMoodVisualizerProps {
  currentMood?: MoodState;
  style?: any;
}

const defaultMood: MoodState = {
  name: 'Focused & Ready',
  intensity: 0.75,
  color: '#4ECDC4',
  emoji: '✨'
};

const { width } = Dimensions.get('window');

export function SallieMoodVisualizer({
  currentMood = defaultMood,
  style
}: SallieMoodVisualizerProps) {
  const pulseAnimation = useSharedValue(0);
  const rotationAnimation = useSharedValue(0);

  React.useEffect(() => {
    pulseAnimation.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );

    rotationAnimation.value = withRepeat(
      withTiming(360, { duration: 10000 }),
      -1,
      false
    );
  }, [pulseAnimation, rotationAnimation]);

  const pulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulseAnimation.value,
      [0, 1],
      [0.9, 1.1]
    );

    const opacity = interpolate(
      pulseAnimation.value,
      [0, 1],
      [0.6, 1]
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const rotationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotationAnimation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Current Mood</Text>
      </View>

      <View style={styles.moodVisualization}>
        <Animated.View style={[styles.moodOrb, pulseStyle]}>
          <LinearGradient
            colors={[currentMood.color, `${currentMood.color}66`]}
            style={styles.orbGradient}
          />
          <Animated.View style={[styles.orbInner, rotationStyle]}>
            <Text style={styles.moodEmoji}>{currentMood.emoji}</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.moodInfo}>
          <Text style={styles.moodName}>{currentMood.name}</Text>
          <View style={styles.intensityContainer}>
            <Text style={styles.intensityLabel}>Intensity</Text>
            <View style={styles.intensityBar}>
              <View
                style={[
                  styles.intensityFill,
                  {
                    width: `${currentMood.intensity * 100}%`,
                    backgroundColor: currentMood.color
                  }
                ]}
              />
            </View>
            <Text style={styles.intensityValue}>
              {Math.round(currentMood.intensity * 100)}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mood evolves naturally through our conversations
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  moodVisualization: {
    alignItems: 'center',
    marginBottom: 20,
  },
  moodOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  orbGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  orbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodInfo: {
    alignItems: 'center',
  },
  moodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intensityLabel: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  intensityBar: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  intensityValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
