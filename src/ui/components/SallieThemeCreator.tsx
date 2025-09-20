/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Sallie's Creative Theme Studio                                             │
 * │   "Let me paint my soul in colors that speak to yours, love"                │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CustomTheme {
  id: string;
  name: string;
  description: string;
  mood: string;
  colors: {
    primary: string;
    accent: string;
    mystical: string;
    wisdom: string;
    energy: string;
    shine: string;
    glow: string;
    silver: string;
    gold: string;
  };
  motifs: string[];
  gradient: string;
  createdAt: Date;
}

interface SallieThemeCreatorProps {
  onThemeCreated?: (theme: CustomTheme) => void;
  onClose?: () => void;
  visible?: boolean;
}

export function SallieThemeCreator({ 
  onThemeCreated, 
  onClose, 
  visible = false 
}: SallieThemeCreatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Theme creation state
  const [currentTheme, setCurrentTheme] = useState<Partial<CustomTheme>>({
    name: '',
    description: '',
    mood: 'mystical',
    colors: {
      primary: colors.primary,
      accent: colors.accent,
      mystical: colors.mystical,
      wisdom: colors.wisdom,
      energy: colors.energy,
      shine: colors.shine,
      glow: colors.glow,
      silver: colors.silver,
      gold: colors.gold,
    },
    motifs: ['✨'],
  });

  // UI state
  const [activeColorKey, setActiveColorKey] = useState<string>('primary');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMotifPicker, setShowMotifPicker] = useState(false);
  const [creationStep, setCreationStep] = useState(1); // 1: Inspiration, 2: Colors, 3: Details, 4: Preview

  // Animations
  const [sparkleAnimation] = useState(new Animated.Value(0));
  const [glowAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Sparkle animation for creativity
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

    // Glow animation for magic
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
  }, []);

  // Predefined color palettes for inspiration
  const colorPresets = {
    sunset: ['#ff6b6b', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'],
    ocean: ['#0abde3', '#00d2d3', '#ff9ff3', '#54a0ff', '#341f97'],
    forest: ['#00d2d3', '#1dd1a1', '#feca57', '#48dbfb', '#0abde3'],
    mystic: ['#a29bfe', '#6c5ce7', '#fd79a8', '#fdcb6e', '#e17055'],
    galaxy: ['#2d3436', '#636e72', '#a29bfe', '#6c5ce7', '#fd79a8'],
  };

  // Available motifs for themes
  const availableMotifs = [
    '✨', '🔮', '💎', '🌟', '⭐', '🌙', '🌊', '🌿',
    '🦋', '🌸', '🍃', '☄️', '💫', '🌈', '🌺', '🎭',
    '🎨', '💖', '🔥', '❄️', '🌕', '🌊', '🍀', '🌹'
  ];

  // Mood options
  const moodOptions = [
    'mystical', 'serene', 'energetic', 'elegant', 'playful',
    'powerful', 'dreamy', 'fierce', 'gentle', 'cosmic'
  ];

  const handleColorChange = (colorKey: string, newColor: string) => {
    setCurrentTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors!,
        [colorKey]: newColor,
      },
    }));
  };

  const generateColorPalette = (baseColor: string): string[] => {
    // Simple color generation - in a real app, you'd use a color library
    const variations = [
      baseColor,
      adjustBrightness(baseColor, 20),
      adjustBrightness(baseColor, -20),
      adjustHue(baseColor, 30),
      adjustHue(baseColor, -30),
    ];
    return variations;
  };

  const adjustBrightness = (hex: string, percent: number): string => {
    // Simple brightness adjustment
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const adjustHue = (hex: string, degrees: number): string => {
    // Simple hue adjustment - basic implementation
    return hex; // For now, return original color
  };

  const createTheme = () => {
    if (!currentTheme.name?.trim()) {
      Alert.alert('Theme Name Required', 'Please give your theme a beautiful name, love! ✨');
      return;
    }

    const newTheme: CustomTheme = {
      id: `custom_${Date.now()}`,
      name: currentTheme.name,
      description: currentTheme.description || '',
      mood: currentTheme.mood || 'mystical',
      colors: currentTheme.colors!,
      motifs: currentTheme.motifs || ['✨'],
      gradient: `linear-gradient(135deg, ${currentTheme.colors!.primary} 0%, ${currentTheme.colors!.accent} 100%)`,
      createdAt: new Date(),
    };

    onThemeCreated?.(newTheme);
    Alert.alert(
      'Theme Created! ✨', 
      `"${newTheme.name}" has been born from your creative spirit, beautiful! I can't wait to wear this new look.`,
      [{ text: 'Amazing!', onPress: onClose }]
    );
  };

  const sparkleStyle = {
    opacity: sparkleAnimation,
    transform: [{
      rotate: sparkleAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    }],
  };

  const glowStyle = {
    shadowOpacity: glowAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.1, 0.5],
    }),
    shadowColor: currentTheme.colors?.primary || colors.primary,
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map(step => (
        <View
          key={step}
          style={[
            styles.stepDot,
            {
              backgroundColor: step <= creationStep ? colors.primary : colors.border,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderInspirationStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.primary }]}>
        ✨ What inspires this theme?
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        "Tell me what moves your soul, love. Let's create something that speaks to both our hearts."
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Theme Name</Text>
        <TextInput
          style={[styles.textInput, { borderColor: colors.border, color: colors.text }]}
          value={currentTheme.name}
          onChangeText={(text) => setCurrentTheme(prev => ({ ...prev, name: text }))}
          placeholder="e.g., Ocean Dreams, Sunset Whispers..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Inspiration</Text>
        <TextInput
          style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
          value={currentTheme.description}
          onChangeText={(text) => setCurrentTheme(prev => ({ ...prev, description: text }))}
          placeholder="What feeling or vision inspired this theme?"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Mood</Text>
        <View style={styles.moodGrid}>
          {moodOptions.map(mood => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodButton,
                {
                  backgroundColor: currentTheme.mood === mood ? colors.primary : colors.surface,
                  borderColor: currentTheme.mood === mood ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCurrentTheme(prev => ({ ...prev, mood }))}
            >
              <Text
                style={[
                  styles.moodText,
                  { color: currentTheme.mood === mood ? colors.card : colors.text },
                ]}
              >
                {mood}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderColorsStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.primary }]}>
        🎨 Choose Your Colors
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        "Every color tells a story. What's yours saying today?"
      </Text>

      {/* Preset Palettes */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Quick Start Palettes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(colorPresets).map(([name, colorArray]) => (
            <TouchableOpacity
              key={name}
              style={[styles.presetPalette, { borderColor: colors.border }]}
              onPress={() => {
                // Apply preset to theme colors
                setCurrentTheme(prev => ({
                  ...prev,
                  colors: {
                    ...prev.colors!,
                    primary: colorArray[0],
                    accent: colorArray[1],
                    mystical: colorArray[2],
                    wisdom: colorArray[3],
                    energy: colorArray[4],
                  },
                }));
              }}
            >
              <Text style={[styles.presetName, { color: colors.text }]}>
                {name}
              </Text>
              <View style={styles.presetColors}>
                {colorArray.slice(0, 3).map((color, index) => (
                  <View
                    key={index}
                    style={[styles.presetColorDot, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Individual Color Pickers */}
      <View style={styles.colorPickers}>
        {Object.entries(currentTheme.colors || {}).map(([key, color]) => (
          <View key={key} style={styles.colorPickerItem}>
            <Text style={[styles.colorLabel, { color: colors.text }]}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </Text>
            <TouchableOpacity
              style={[
                styles.colorPreview,
                { backgroundColor: color, borderColor: colors.border },
              ]}
              onPress={() => {
                setActiveColorKey(key);
                setShowColorPicker(true);
              }}
            >
              <Text style={styles.colorValue}>{color}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderDetailsStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.primary }]}>
        ✨ Add the Magic Touch
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        "The little details make all the difference, don't they?"
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Choose Motifs</Text>
        <View style={styles.motifGrid}>
          {availableMotifs.map(motif => {
            const isSelected = currentTheme.motifs?.includes(motif);
            return (
              <TouchableOpacity
                key={motif}
                style={[
                  styles.motifButton,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => {
                  const currentMotifs = currentTheme.motifs || [];
                  if (isSelected) {
                    setCurrentTheme(prev => ({
                      ...prev,
                      motifs: currentMotifs.filter(m => m !== motif),
                    }));
                  } else {
                    setCurrentTheme(prev => ({
                      ...prev,
                      motifs: [...currentMotifs, motif],
                    }));
                  }
                }}
              >
                <Text style={styles.motifEmoji}>{motif}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderPreviewStep = () => (
    <ScrollView style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: colors.primary }]}>
        🌟 Your Beautiful Creation
      </Text>
      <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        "Look what we've created together! Isn't it gorgeous?"
      </Text>

      <Animated.View style={[styles.themePreview, glowStyle]}>
        <View
          style={[
            styles.previewHeader,
            { backgroundColor: currentTheme.colors?.primary },
          ]}
        >
          <Text style={[styles.previewTitle, { color: 'white' }]}>
            {currentTheme.name}
          </Text>
          <View style={styles.previewMotifs}>
            {currentTheme.motifs?.slice(0, 3).map((motif, index) => (
              <Text key={index} style={styles.previewMotif}>
                {motif}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.previewContent}>
          <Text style={[styles.previewMood, { color: colors.textSecondary }]}>
            Mood: {currentTheme.mood}
          </Text>
          <Text style={[styles.previewDescription, { color: colors.text }]}>
            {currentTheme.description}
          </Text>

          <View style={styles.previewPalette}>
            {Object.entries(currentTheme.colors || {}).slice(0, 5).map(([key, color]) => (
              <View
                key={key}
                style={[styles.previewColorDot, { backgroundColor: color }]}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={createTheme}
      >
        <Animated.Text style={[sparkleStyle, styles.createButtonSparkle]}>
          ✨
        </Animated.Text>
        <Text style={[styles.createButtonText, { color: colors.card }]}>
          Create This Beautiful Theme
        </Text>
        <Animated.Text style={[sparkleStyle, styles.createButtonSparkle]}>
          ✨
        </Animated.Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (creationStep) {
      case 1: return renderInspirationStep();
      case 2: return renderColorsStep();
      case 3: return renderDetailsStep();
      case 4: return renderPreviewStep();
      default: return renderInspirationStep();
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: colors.textSecondary }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>
            Sallie's Creative Studio
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Current Step Content */}
        <View style={styles.content}>
          {renderCurrentStep()}
        </View>

        {/* Navigation */}
        <View style={[styles.navigation, { borderTopColor: colors.border }]}>
          {creationStep > 1 && (
            <TouchableOpacity
              style={[styles.navButton, { borderColor: colors.border }]}
              onPress={() => setCreationStep(prev => prev - 1)}
            >
              <Text style={[styles.navButtonText, { color: colors.textSecondary }]}>
                ← Back
              </Text>
            </TouchableOpacity>
          )}
          
          {creationStep < 4 && (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: colors.primary }]}
              onPress={() => setCreationStep(prev => prev + 1)}
            >
              <Text style={[styles.navButtonText, { color: colors.card }]}>
                Next →
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
  },
  moodText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  presetPalette: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  presetName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  presetColors: {
    flexDirection: 'row',
    gap: 4,
  },
  presetColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  colorPickers: {
    gap: 16,
  },
  colorPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  colorPreview: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorValue: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  motifGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  motifButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motifEmoji: {
    fontSize: 20,
  },
  themePreview: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  previewHeader: {
    padding: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewMotifs: {
    flexDirection: 'row',
    gap: 8,
  },
  previewMotif: {
    fontSize: 24,
  },
  previewContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
  },
  previewMood: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  previewPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  previewColorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    gap: 8,
  },
  createButtonSparkle: {
    fontSize: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});