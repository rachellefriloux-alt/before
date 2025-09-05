/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Extended colors for Sallie AI
    primary: '#6366f1',
    secondary: '#64748b',
    accent: '#8b5cf6',
    surface: '#ffffff',
    surfaceElevated: '#f8fafc',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#ffffff',
    mystical: '#8b5cf6',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Extended colors for Sallie AI
    primary: '#8b5cf6',
    secondary: '#94a3b8',
    accent: '#a78bfa',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    textSecondary: '#94a3b8',
    border: '#475569',
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    card: '#1e293b',
    mystical: '#a78bfa',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};
