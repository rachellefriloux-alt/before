/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#6366f1';
const tintColorDark = '#8b5cf6';

export const Colors = {
  light: {
    text: '#0f172a',
    textSecondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    surfaceElevated: '#ffffff',
    tint: tintColorLight,
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    icon: '#64748b',
    iconSecondary: '#94a3b8',
    border: '#e2e8f0',
    borderFocus: tintColorLight,
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorLight,
    overlay: 'rgba(0, 0, 0, 0.1)',
    gradient: {
      primary: `linear-gradient(135deg, ${tintColorLight} 0%, #8b5cf6 100%)`,
      surface: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    }
  },
  dark: {
    text: '#f8fafc',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceElevated: '#334155',
    tint: tintColorDark,
    accent: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    icon: '#94a3b8',
    iconSecondary: '#64748b',
    border: '#334155',
    borderFocus: tintColorDark,
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorDark,
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: {
      primary: `linear-gradient(135deg, ${tintColorDark} 0%, #a855f7 100%)`,
      surface: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.2)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2)'
    }
  },
};
