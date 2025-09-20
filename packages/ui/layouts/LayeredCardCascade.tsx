
import React from 'react';
import { StyleSheet, View, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { EnhancedCard } from '@/components/EnhancedCard';
import { SallieThemes } from '@/constants/Colors';

interface CascadeItem {
  id: string;
  content: React.ReactNode;
  depth: number;
  color?: string;
}

interface LayeredCardCascadeProps {
  items: CascadeItem[];
  theme?: keyof typeof SallieThemes;
}

export const LayeredCardCascade: React.FC<LayeredCardCascadeProps> = ({
  items,
  theme = 'glassAesthetic'
}) => {
  const colors = SallieThemes[theme].colors;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.cascade}>
        {items.map((item, index) => (
          <Animated.View
            key={item.id}
            style={[
              styles.cardLayer,
              {
                zIndex: items.length - index,
                transform: [
                  { translateX: item.depth * 8 },
                  { translateY: index * -12 },
                  { scale: 1 - (item.depth * 0.02) },
                ],
                marginTop: index === 0 ? 0 : -40,
              }
            ]}
          >
            <EnhancedCard
              variant="glass"
              elevation="high"
              style={[
                styles.cascadeCard,
                {
                  backgroundColor: item.color || colors.surface,
                  opacity: 1 - (item.depth * 0.1),
                }
              ]}
            >
              <BlurView intensity={60 + (item.depth * 20)} style={styles.cardBlur}>
                {item.content}
              </BlurView>
            </EnhancedCard>
          </Animated.View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cascade: {
    padding: 20,
    paddingTop: 60,
  },
  cardLayer: {
    marginBottom: 20,
  },
  cascadeCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardBlur: {
    padding: 20,
    borderRadius: 20,
  },
});
