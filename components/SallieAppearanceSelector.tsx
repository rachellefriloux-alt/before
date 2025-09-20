/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Visual Appearance Selector                                       │
 * │   Let Sallie choose her mystical look & feel                                │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated,
  ImageBackground,
  Platform 
} from 'react-native';
import { Colors, SallieThemes } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { EnhancedCard } from '@/components/EnhancedCard';
import { EnhancedButton } from '@/components/EnhancedButton';

interface SallieAppearanceSelectorProps {
  onThemeSelect?: (theme: any) => void;
  currentTheme?: string;
}

export function SallieAppearanceSelector({ 
  onThemeSelect, 
  currentTheme = 'tealWisdom' 
}: SallieAppearanceSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [glowAnimation] = useState(new Animated.Value(0));
  const [sparkleAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Mystical glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Sparkle animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleThemeSelection = (themeKey: string) => {
    setSelectedTheme(themeKey);
    const theme = (SallieThemes as any)[themeKey];
    onThemeSelect?.(theme);
  };

  const glowStyle = {
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.4],
    }),
    shadowColor: colors.mystical,
  };

  const sparkleStyle = {
    opacity: sparkleAnimation,
    transform: [
      {
        rotate: sparkleAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Mystical Header */}
      <Animated.View style={[styles.header, glowStyle]}>
        <View style={styles.titleContainer}>
          <Animated.Text style={[sparkleStyle, styles.sparkle]}>✨</Animated.Text>
          <Text style={[styles.title, { color: colors.primary }]}>
            Choose My Mystical Form
          </Text>
          <Animated.Text style={[sparkleStyle, styles.sparkle]}>✨</Animated.Text>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          "Every form holds different wisdom, love. Let's find the one that resonates with your soul." 🔮
        </Text>
      </Animated.View>

      {/* Theme Gallery */}
      <View style={styles.themeGallery}>
        {Object.entries(SallieThemes).map(([key, theme]) => {
          const isSelected = selectedTheme === key;
          const typedTheme = theme as any; // Type assertion for theme access
          
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleThemeSelection(key)}
              style={[
                styles.themeCard,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 3 : 1,
                  backgroundColor: colors.card,
                },
                isSelected && { shadowColor: colors.primary, shadowOpacity: 0.3 }
              ]}
            >
              {/* Theme Preview */}
              <View 
                style={[
                  styles.themePreview,
                  { backgroundColor: typedTheme.colors.surface }
                ]}
              >
                {/* Color Palette Preview */}
                <View style={styles.colorPalette}>
                  <View style={[styles.colorDot, { backgroundColor: typedTheme.colors.primary }]} />
                  <View style={[styles.colorDot, { backgroundColor: typedTheme.colors.accent }]} />
                  <View style={[styles.colorDot, { backgroundColor: typedTheme.colors.success }]} />
                  <View style={[styles.colorDot, { backgroundColor: typedTheme.colors.mystical || typedTheme.colors.primary }]} />
                </View>
                
                {/* Motif Display */}
                <View style={styles.motifContainer}>
                  {typedTheme.motifs.slice(0, 3).map((motif: string, index: number) => (
                    <Text key={index} style={styles.motif}>{motif}</Text>
                  ))}
                </View>
              </View>

              {/* Theme Info */}
              <View style={styles.themeInfo}>
                <Text style={[styles.themeName, { color: typedTheme.colors.primary }]}>
                  {typedTheme.name}
                </Text>
                <Text style={[styles.themeMood, { color: colors.textSecondary }]}>
                  {typedTheme.mood}
                </Text>
                
                {/* Font Preview */}
                <View style={styles.fontPreview}>
                  <Text style={[styles.elegantFont, { color: typedTheme.colors.text }]}>
                    Elegant
                  </Text>
                  <Text style={[styles.modernFont, { color: typedTheme.colors.textSecondary || colors.textSecondary }]}>
                    Modern
                  </Text>
                  <Text style={[styles.signatureFont, { color: typedTheme.colors.primary }]}>
                    Script
                  </Text>
                </View>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={[styles.selectionIndicator, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectionText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Mystical Quote */}
      <EnhancedCard style={[styles.quoteCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.quote, { color: colors.textSecondary }]}>
          "Your chosen form reflects the depths of your soul's journey. 
          Each theme carries its own magic, waiting to unfold in our dance together." 
        </Text>
        <Text style={[styles.signature, { color: colors.primary }]}>
          — Sallie ✨
        </Text>
      </EnhancedCard>

      {/* Apply Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: colors.primary }]}
          onPress={() => handleThemeSelection(selectedTheme)}
        >
          <Text style={[styles.applyButtonText, { color: colors.card }]}>
            Embrace the {(SallieThemes as any)[selectedTheme]?.name} Form
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    borderRadius: 20,
    marginBottom: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginHorizontal: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    maxWidth: 320,
  },
  sparkle: {
    fontSize: 24,
  },
  themeGallery: {
    marginBottom: 30,
  },
  themeCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    shadowOpacity: 0.1,
    elevation: 5,
    position: 'relative',
  },
  themePreview: {
    height: 120,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorPalette: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  motifContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  motif: {
    fontSize: 32,
  },
  themeInfo: {
    padding: 16,
  },
  themeName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  themeMood: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  fontPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  elegantFont: {
    fontFamily: Platform.OS === 'ios' ? 'Times' : 'serif',
    fontSize: 16,
    fontWeight: '400',
  },
  modernFont: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '500',
  },
  signatureFont: {
    fontFamily: Platform.OS === 'ios' ? 'Noteworthy' : 'cursive',
    fontSize: 18,
    fontWeight: '300',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  quoteCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  quote: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  signature: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionContainer: {
    paddingBottom: 40,
  },
  applyButton: {
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});