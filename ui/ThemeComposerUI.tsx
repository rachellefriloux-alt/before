/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Theme composer UI for managing and applying visual themes.
 * Got it, love.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { generateTheme, getThemePresets, applyThemeToDocument, GradientTheme } from './visual/themeGenerator';

export interface ThemeOption {
  id: string;
  name: string;
  description: string;
  preview: GradientTheme;
  category: 'preset' | 'generated' | 'custom';
}

class ThemeManager {
  private currentTheme: GradientTheme | null = null;
  private themeHistory: string[] = [];

  constructor() {
    this.initializeDefaultThemes();
  }

  private initializeDefaultThemes() {
    // Themes are managed through themeGenerator.ts
  }

  getAvailableThemes(): ThemeOption[] {
    const presets = getThemePresets();
    const themeOptions: ThemeOption[] = [];

    // Add preset themes
    presets.forEach((preset: string) => {
      const theme = generateTheme('calm', preset);
      themeOptions.push({
        id: preset,
        name: this.formatThemeName(preset),
        description: `Professional ${this.formatThemeName(preset).toLowerCase()} theme`,
        preview: theme,
        category: 'preset'
      });
    });

    // Add generated themes based on emotions
    const emotions = ['calm', 'focused', 'energetic', 'supportive', 'protective'];
    emotions.forEach(emotion => {
      const theme = generateTheme(emotion);
      themeOptions.push({
        id: `generated_${emotion}`,
        name: `${this.capitalizeFirst(emotion)} Theme`,
        description: `Mood-based theme for ${emotion} moments`,
        preview: theme,
        category: 'generated'
      });
    });

    return themeOptions;
  }

  private formatThemeName(preset: string): string {
    return preset.split('-').map(word => this.capitalizeFirst(word)).join(' ');
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async applyTheme(themeId: string, userId: string): Promise<boolean> {
    try {
      let theme: GradientTheme;

      if (themeId.startsWith('generated_')) {
        const emotion = themeId.replace('generated_', '');
        theme = generateTheme(emotion);
      } else {
        theme = generateTheme('calm', themeId);
      }

      // Apply theme to document/web context
      if (typeof document !== 'undefined') {
        applyThemeToDocument(theme);
      }

      this.currentTheme = theme;
      this.themeHistory.push(themeId);

      // Keep only last 10 themes in history
      if (this.themeHistory.length > 10) {
        this.themeHistory = this.themeHistory.slice(-10);
      }

      console.log(`Theme ${themeId} applied successfully for user ${userId}`);
      return true;

    } catch (error) {
      console.error(`Error applying theme ${themeId}:`, error);
      return false;
    }
  }

  getCurrentTheme(): GradientTheme | null {
    return this.currentTheme;
  }

  getThemeHistory(): string[] {
    return [...this.themeHistory];
  }

  generateCustomTheme(baseEmotion: string, customizations: Partial<GradientTheme>): GradientTheme {
    const baseTheme = generateTheme(baseEmotion);
    return { ...baseTheme, ...customizations };
  }
}

// Singleton instance
export const themeManager = new ThemeManager();

interface ThemePreviewProps {
  theme: GradientTheme;
  size?: 'small' | 'medium' | 'large';
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, size = 'medium' }) => {
  const previewSize = {
    small: 60,
    medium: 80,
    large: 100
  }[size];

  return (
    <View style={[styles.themePreview, { width: previewSize, height: previewSize }]}>
      <View
        style={[
          styles.themePreviewGradient,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.shadowColor,
          }
        ]}
      />
      <View
        style={[
          styles.themePreviewAccent,
          { backgroundColor: theme.accent }
        ]}
      />
    </View>
  );
};

interface ThemeComposerProps {
  userId: string;
  onThemeApplied?: (themeId: string) => void;
  initialThemeId?: string;
}

export const ThemeComposerUI: React.FC<ThemeComposerProps> = ({
  userId,
  onThemeApplied,
  initialThemeId
}) => {
  const [availableThemes] = useState<ThemeOption[]>(() => themeManager.getAvailableThemes());
  const [currentThemeId, setCurrentThemeId] = useState<string>(initialThemeId || '');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'preset' | 'generated'>('all');

  const filteredThemes = availableThemes.filter(theme =>
    selectedCategory === 'all' || theme.category === selectedCategory
  );

  const applyTheme = useCallback(async (themeId: string) => {
    const success = await themeManager.applyTheme(themeId, userId);
    if (success) {
      setCurrentThemeId(themeId);
      if (onThemeApplied) {
        onThemeApplied(themeId);
      }
      Alert.alert('Theme Applied', 'Your theme has been updated successfully!');
    } else {
      Alert.alert('Error', 'Failed to apply theme. Please try again.');
    }
  }, [userId, onThemeApplied]);

  const categories = [
    { id: 'all' as const, name: 'All Themes' },
    { id: 'preset' as const, name: 'Presets' },
    { id: 'generated' as const, name: 'Generated' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Theme Composer</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.themeGrid} showsVerticalScrollIndicator={false}>
        {filteredThemes.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.themeCard,
              currentThemeId === theme.id && styles.themeCardActive
            ]}
            onPress={() => applyTheme(theme.id)}
          >
            <ThemePreview theme={theme.preview} size="large" />
            <View style={styles.themeInfo}>
              <Text style={styles.themeName}>{theme.name}</Text>
              <Text style={styles.themeDescription}>{theme.description}</Text>
            </View>
            {currentThemeId === theme.id && (
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.randomThemeButton}
          onPress={() => {
            const randomTheme = filteredThemes[Math.floor(Math.random() * filteredThemes.length)];
            if (randomTheme) {
              applyTheme(randomTheme.id);
            }
          }}
        >
          <Text style={styles.randomThemeButtonText}>🎲 Random Theme</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  themeGrid: {
    flex: 1,
  },
  themeCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeCardActive: {
    borderColor: '#6366f1',
    borderWidth: 2,
  },
  themePreview: {
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  themePreviewGradient: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  themePreviewAccent: {
    height: 8,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  activeIndicator: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  randomThemeButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  randomThemeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemeComposerUI;
