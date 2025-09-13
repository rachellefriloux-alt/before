import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorValue } from 'react-native';

interface ThemeGradient {
  [key: string]: readonly ColorValue[];
}

interface Theme {
  name: string;
  isDark: boolean;
  colors: {
    primary: ColorValue;
    secondary: ColorValue;
    background: ColorValue;
    surface: ColorValue;
    text: ColorValue;
    textSecondary: ColorValue;
    accent: ColorValue;
    error: ColorValue;
    success: ColorValue;
    warning: ColorValue;
    border: ColorValue;
    shadow: ColorValue;
    card: ColorValue;
  };
  gradients: {
    sallie: readonly ColorValue[];
    background: readonly ColorValue[];
    primary: readonly ColorValue[];
    secondary: readonly ColorValue[];
    [key: string]: readonly ColorValue[];
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
    light: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const darkTheme: Theme = {
  name: 'Dark',
  isDark: true,
  colors: {
    primary: '#FFD700',
    secondary: '#9370DB',
    background: '#1a1a2e',
    surface: '#16213e',
    text: '#f5f5f5',
    textSecondary: '#ccc',
    accent: '#4ECDC4',
    error: '#FF6B6B',
    success: '#6BCF7F',
    warning: '#FFD93D',
    border: 'rgba(255,255,255,0.1)',
    shadow: 'rgba(0,0,0,0.3)',
    card: '#0f3460',
  },
  gradients: {
    sallie: ['#E6E6FA', '#9370DB', '#4B0082'] as const,
    background: ['#1a1a2e', '#16213e', '#0f3460'] as const,
    primary: ['#FFD700', '#FFA500', '#FF8C00'] as const,
    secondary: ['#9370DB', '#8A2BE2', '#6A0DAD'] as const,
  },
  fonts: {
    regular: 'SpaceMono',
    medium: 'SpaceMono',
    bold: 'SpaceMono',
    light: 'SpaceMono',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

const lightTheme: Theme = {
  name: 'Light',
  isDark: false,
  colors: {
    primary: '#9370DB',
    secondary: '#FFD700',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    textSecondary: '#666666',
    accent: '#4ECDC4',
    error: '#DC3545',
    success: '#28A745',
    warning: '#FFC107',
    border: 'rgba(0,0,0,0.1)',
    shadow: 'rgba(0,0,0,0.1)',
    card: '#e9ecef',
  },
  gradients: {
    sallie: ['#E6E6FA', '#DDA0DD', '#DA70D6'] as const,
    background: ['#ffffff', '#f8f9fa', '#e9ecef'] as const,
    primary: ['#9370DB', '#8A2BE2', '#7B68EE'] as const,
    secondary: ['#FFD700', '#FFA500', '#FF8C00'] as const,
  },
  fonts: {
    regular: 'SpaceMono',
    medium: 'SpaceMono',
    bold: 'SpaceMono',
    light: 'SpaceMono',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

interface ThemeState {
  currentTheme: Theme;
  isDarkMode: boolean;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;

  // Actions
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  updateThemeColors: (colors: Partial<Theme['colors']>) => void;
  resetTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: darkTheme,
      isDarkMode: true,
      animations: true,
      reducedMotion: false,
      highContrast: false,

      toggleTheme: () => set((state) => ({
        isDarkMode: !state.isDarkMode,
        currentTheme: state.isDarkMode ? lightTheme : darkTheme,
      })),

      setDarkMode: (isDark) => set({
        isDarkMode: isDark,
        currentTheme: isDark ? darkTheme : lightTheme,
      }),

      setAnimations: (enabled) => set({
        animations: enabled,
      }),

      setReducedMotion: (enabled) => set({
        reducedMotion: enabled,
        animations: enabled ? false : get().animations,
      }),

      setHighContrast: (enabled) => set({
        highContrast: enabled,
      }),

      updateThemeColors: (colors) => set((state) => ({
        currentTheme: {
          ...state.currentTheme,
          colors: { ...state.currentTheme.colors, ...colors },
        },
      })),

      resetTheme: () => set({
        currentTheme: darkTheme,
        isDarkMode: true,
        animations: true,
        reducedMotion: false,
        highContrast: false,
      }),
    }),
    {
      name: 'theme-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);