/*
 * Sallie Sovereign - Personality Screen
 * View and manage Sallie's personality traits and evolution
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { usePersona } from '../contexts/PersonaContext';

const { width } = Dimensions.get('window');

export default function PersonalityScreen() {
  const { theme } = useTheme();
  const { personalityState, currentEmotion } = usePersona();

  const styles = createStyles(theme);

  if (!personalityState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading personality data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Current State Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sallie's Personality</Text>
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>Currently: {currentEmotion}</Text>
          </View>
        </View>

        {/* Personality Traits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Traits</Text>
          
          {Object.entries(personalityState.traits).map(([key, trait]) => (
            <View key={key} style={styles.traitContainer}>
              <View style={styles.traitHeader}>
                <Text style={styles.traitName}>{trait.name}</Text>
                <Text style={styles.traitValue}>{Math.round(trait.value * 100)}%</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${trait.value * 100}%` }
                    ]}
                  />
                </View>
              </View>
              
              <Text style={styles.traitDescription}>{trait.description}</Text>
              
              <View style={styles.stabilityContainer}>
                <Text style={styles.stabilityText}>
                  Stability: {Math.round(trait.stability * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Current State Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current State</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Energy Level</Text>
              <Text style={styles.metricValue}>{Math.round(personalityState.energyLevel * 100)}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${personalityState.energyLevel * 100}%` }]} />
              </View>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Stress Level</Text>
              <Text style={styles.metricValue}>{Math.round(personalityState.stressLevel * 100)}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, styles.stressFill, { width: `${personalityState.stressLevel * 100}%` }]} />
              </View>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Social Need</Text>
              <Text style={styles.metricValue}>{Math.round(personalityState.socialNeed * 100)}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${personalityState.socialNeed * 100}%` }]} />
              </View>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Adaptability</Text>
              <Text style={styles.metricValue}>{Math.round(personalityState.adaptability * 100)}%</Text>
              <View style={styles.metricBar}>
                <View style={[styles.metricFill, { width: `${personalityState.adaptability * 100}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Mood Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Mood</Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodText}>{personalityState.currentMood.toUpperCase()}</Text>
            <Text style={styles.moodDescription}>
              {getMoodDescription(personalityState.currentMood)}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function getMoodDescription(mood: string): string {
  const descriptions: Record<string, string> = {
    content: "Feeling balanced and ready to help with whatever you need.",
    happy: "In a cheerful mood and excited to engage with you!",
    excited: "Full of energy and enthusiasm for our interactions!",
    calm: "Peaceful and centered, ready to provide thoughtful responses.",
    focused: "Highly attentive and ready to tackle complex tasks.",
    playful: "In a lighthearted mood, ready for fun conversations!",
  };
  
  return descriptions[mood] || "Experiencing a unique emotional state.";
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    header: {
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    emotionBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    emotionText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    traitContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    traitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    traitName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    traitValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    progressContainer: {
      marginBottom: theme.spacing.sm,
    },
    progressTrack: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    traitDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    stabilityContainer: {
      alignItems: 'flex-end',
    },
    stabilityText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    metricCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      width: (width - theme.spacing.md * 3) / 2,
      marginBottom: theme.spacing.md,
    },
    metricLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    metricBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    metricFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
    },
    stressFill: {
      backgroundColor: theme.colors.warning,
    },
    moodContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    moodText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    moodDescription: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
  });
}