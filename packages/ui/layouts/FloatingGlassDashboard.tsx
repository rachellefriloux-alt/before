
import React from 'react';
import { StyleSheet, View, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { EnhancedCard } from '@/components/EnhancedCard';
import { SallieThemes } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

interface FloatingGlassDashboardProps {
  children: React.ReactNode;
  theme?: keyof typeof SallieThemes;
}

export const FloatingGlassDashboard: React.FC<FloatingGlassDashboardProps> = ({
  children,
  theme = 'glassAesthetic'
}) => {
  const colors = SallieThemes[theme].colors;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.background, colors.surface]}
        style={styles.backgroundGradient}
      />

      {/* Floating mystical elements */}
      <View style={[styles.floatingElement, styles.element1]} />
      <View style={[styles.floatingElement, styles.element2]} />
      <View style={[styles.floatingElement, styles.element3]} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  element1: {
    width: 200,
    height: 200,
    top: '10%',
    right: '-10%',
    backgroundColor: '#14b8a6',
  },
  element2: {
    width: 150,
    height: 150,
    bottom: '20%',
    left: '-5%',
    backgroundColor: '#10b981',
  },
  element3: {
    width: 180,
    height: 180,
    top: '50%',
    right: '70%',
    backgroundColor: '#0ea5e9',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
  grid: {
    gap: 16,
  },
});
