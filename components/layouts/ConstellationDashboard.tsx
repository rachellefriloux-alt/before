
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SallieThemes } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface Star {
  id: string;
  x: number;
  y: number;
  size: number;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface ConstellationDashboardProps {
  stars: Star[];
  theme?: keyof typeof SallieThemes;
}

export const ConstellationDashboard: React.FC<ConstellationDashboardProps> = ({ 
  stars, 
  theme = 'glassAesthetic' 
}) => {
  const colors = SallieThemes[theme].colors;
  const sparkleAnimations = useRef(stars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = sparkleAnimations.map((anim, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000 + (index * 200),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 2000 + (index * 200),
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.starfield}
      />
      
      {/* Constellation connections */}
      <View style={styles.connections}>
        {stars.map((star, index) => {
          if (index === stars.length - 1) return null;
          const nextStar = stars[index + 1];
          
          return (
            <View
              key={`connection-${star.id}`}
              style={[
                styles.connectionLine,
                {
                  position: 'absolute',
                  left: star.x,
                  top: star.y,
                  width: Math.sqrt(Math.pow(nextStar.x - star.x, 2) + Math.pow(nextStar.y - star.y, 2)),
                  transform: [
                    { 
                      rotate: `${Math.atan2(nextStar.y - star.y, nextStar.x - star.x)}rad` 
                    }
                  ],
                  backgroundColor: colors.primary,
                }
              ]}
            />
          );
        })}
      </View>

      {/* Stars */}
      {stars.map((star, index) => (
        <TouchableOpacity
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x - star.size / 2,
              top: star.y - star.size / 2,
              width: star.size,
              height: star.size,
            }
          ]}
          onPress={star.onPress}
        >
          <Animated.View
            style={[
              styles.starGlow,
              {
                opacity: sparkleAnimations[index],
                backgroundColor: star.color,
              }
            ]}
          />
          <LinearGradient
            colors={[star.color, `${star.color}80`]}
            style={styles.starCore}
          />
          <View style={styles.starContent}>
            <Text style={styles.starIcon}>{star.icon}</Text>
            <Text style={[styles.starTitle, { color: colors.card }]}>{star.title}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connections: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  connectionLine: {
    height: 1,
    opacity: 0.3,
  },
  star: {
    position: 'absolute',
    borderRadius: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  starGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 1000,
    opacity: 0.3,
  },
  starCore: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 1000,
  },
  starContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  starIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  starTitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
