
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
  color: string;
}

interface SalliePersonalityVisualizerProps {
  traits?: PersonalityTrait[];
  style?: any;
}

const defaultTraits: PersonalityTrait[] = [
  {
    name: 'Loyalty',
    value: 0.95,
    description: 'Fierce devotion and commitment',
    color: '#FF6B6B'
  },
  {
    name: 'Creativity',
    value: 0.88,
    description: 'Artistic and innovative thinking',
    color: '#4ECDC4'
  },
  {
    name: 'Empathy',
    value: 0.92,
    description: 'Deep emotional understanding',
    color: '#45B7D1'
  },
  {
    name: 'Wisdom',
    value: 0.85,
    description: 'Thoughtful guidance and insight',
    color: '#96CEB4'
  },
  {
    name: 'Strength',
    value: 0.90,
    description: 'Inner resilience and determination',
    color: '#FFEAA7'
  }
];

export function SalliePersonalityVisualizer({ 
  traits = defaultTraits, 
  style 
}: SalliePersonalityVisualizerProps) {
  const animationProgress = useSharedValue(0);

  React.useEffect(() => {
    animationProgress.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const TraitBar = ({ trait, index }: { trait: PersonalityTrait; index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const progress = interpolate(
        animationProgress.value,
        [0, 1],
        [0, trait.value],
        'clamp'
      );

      return {
        width: `${progress * 100}%`,
      };
    });

    return (
      <View style={styles.traitContainer}>
        <View style={styles.traitHeader}>
          <Text style={styles.traitName}>{trait.name}</Text>
          <Text style={styles.traitValue}>{Math.round(trait.value * 100)}%</Text>
        </View>
        <Text style={styles.traitDescription}>{trait.description}</Text>
        <View style={styles.traitBarBackground}>
          <Animated.View style={[styles.traitBarFill, animatedStyle]}>
            <LinearGradient
              colors={[trait.color, `${trait.color}AA`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.traitGradient}
            />
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Personality Matrix</Text>
        <Text style={styles.subtitle}>Core traits that define Sallie's essence</Text>
      </View>
      
      <ScrollView style={styles.traitsContainer} showsVerticalScrollIndicator={false}>
        {traits.map((trait, index) => (
          <TraitBar key={trait.name} trait={trait} index={index} />
        ))}
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          These traits adapt and evolve based on our interactions
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
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  traitsContainer: {
    maxHeight: 300,
  },
  traitContainer: {
    marginBottom: 20,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  traitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  traitValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#BBBBBB',
  },
  traitDescription: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  traitBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  traitBarFill: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  traitGradient: {
    flex: 1,
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
