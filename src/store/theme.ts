/**
 * Theme Store - Zustand store for theme management
 * Integrates with VisualIdentitySystem for dynamic themes
 */

import { create } from 'zustand';
import { VisualTheme } from '../core/VisualIdentitySystem';

interface ThemeState {
  currentTheme: VisualTheme;
  animations: boolean;
  isDark: boolean;
  adaptiveMode: boolean;
  setTheme: (theme: VisualTheme) => void;
  setAnimations: (enabled: boolean) => void;
  toggleDarkMode: () => void;
  setAdaptiveMode: (enabled: boolean) => void;
}

// Default theme configuration
const defaultTheme: VisualTheme = {
  id: 'sallie_default',
  name: 'Sallie Default',
  description: 'Default theme with Sallie personality',
  category: 'personal',
  mood: 'friendly',
  colors: {
    primary: {
      50: '#fef7ff',
      100: '#fdeeff', 
      200: '#fdd5ff',
      300: '#fcb3ff',
      400: '#fa81ff',
      500: '#f54eff', // Base color
      600: '#e01fff',
      700: '#bf00e3',
      800: '#9c00b8',
      900: '#7f0094',
      950: '#520a61',
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Base color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    },
    accent: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Base color
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
      950: '#431407',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a', // Base color
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b',
    },
    semantic: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Base color
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Base color
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Base color
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6', // Base color
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        inverse: '#0f172a',
      },
      surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#e2e8f0',
        inverse: '#1e293b',
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
        inverse: '#f8fafc',
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        inverse: '#475569',
      },
    },
    gradients: [
      {
        id: 'primary_gradient',
        name: 'Primary Gradient',
        type: 'linear',
        colors: [
          { color: '#f54eff', stop: 0 },
          { color: '#0ea5e9', stop: 1 },
        ],
        direction: '45deg',
      },
    ],
    overlays: {
      backdrop: 'rgba(0, 0, 0, 0.5)',
      modal: 'rgba(255, 255, 255, 0.95)',
      tooltip: 'rgba(0, 0, 0, 0.9)',
      highlight: 'rgba(245, 78, 255, 0.1)',
      selection: 'rgba(14, 165, 233, 0.2)',
      focus: 'rgba(245, 78, 255, 0.3)',
    },
  },
  typography: {
    fontFamilies: {
      primary: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      secondary: 'Georgia, Cambria, Times New Roman, serif',
      monospace: 'SFMono-Regular, Consolas, Liberation Mono, monospace',
      display: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      body: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    textStyles: {
      h1: { fontSize: '3rem', fontWeight: 700, lineHeight: 1.25, letterSpacing: '-0.025em' },
      h2: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.025em' },
      h3: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.375, letterSpacing: 'normal' },
      h4: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.375, letterSpacing: 'normal' },
      h5: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: 'normal' },
      h6: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.5, letterSpacing: 'normal' },
      body: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.5, letterSpacing: 'normal' },
      caption: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.25, letterSpacing: 'normal' },
      overline: { fontSize: '0.75rem', fontWeight: 500, lineHeight: 1, letterSpacing: '0.05em', textTransform: 'uppercase' },
      button: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.25, letterSpacing: '0.025em' },
    },
  },
  spacing: {
    scale: {
      0: '0rem',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
    },
    components: {
      button: { padding: '0.75rem 1.5rem', margin: '0.5rem' },
      input: { padding: '0.75rem', margin: '0.5rem 0' },
      card: { padding: '1.5rem', margin: '1rem' },
      modal: { padding: '2rem', margin: '1rem' },
    },
    layout: {
      container: '1.5rem',
      section: '3rem',
      grid: '1rem',
      content: '1rem',
    },
  },
  animations: {
    durations: {
      instant: 0,
      fast: 150,
      normal: 300,
      slow: 500,
      slower: 1000,
    },
    easings: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    transitions: {
      default: 'all 0.3s ease-in-out',
      color: 'color 0.3s ease-in-out, background-color 0.3s ease-in-out',
      transform: 'transform 0.3s ease-in-out',
      opacity: 'opacity 0.3s ease-in-out',
      shadow: 'box-shadow 0.3s ease-in-out',
    },
    presets: [],
  },
  components: {} as any, // Simplified for now
  metadata: {
    version: '1.0.0',
    author: 'Sallie AI',
    tags: ['default', 'friendly', 'modern'],
    performance: {
      loadTime: 0,
      bundleSize: 0,
      animationPerformance: 0,
      accessibility: 0,
    },
    compatibility: [],
    inspiration: [],
    usage: [],
  },
  adaptiveRules: [],
  accessibility: {
    highContrast: false,
    reducedMotion: { enabled: false },
    largeText: false,
    focusVisible: true,
    colorBlindFriendly: true,
    minContrastRatio: 4.5,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  currentTheme: defaultTheme,
  animations: true,
  isDark: false,
  adaptiveMode: false,
  
  setTheme: (theme: VisualTheme) => set({ currentTheme: theme }),
  
  setAnimations: (enabled: boolean) => set({ animations: enabled }),
  
  toggleDarkMode: () => set((state) => ({ isDark: !state.isDark })),
  
  setAdaptiveMode: (enabled: boolean) => set({ adaptiveMode: enabled }),
}));