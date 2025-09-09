import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { themes, defaultTheme, Theme } from '../themes';

const storage = new MMKV();

export interface ThemeState {
  currentTheme: Theme;
  themeName: string;
  isDarkMode: boolean;
  adaptiveTheme: boolean;
  animations: boolean;
  reducedMotion: boolean;
  
  // Actions
  setTheme: (themeName: string) => void;
  toggleDarkMode: () => void;
  setAdaptiveTheme: (adaptive: boolean) => void;
  setAnimations: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  resetToDefault: () => void;
  getAvailableThemes: () => string[];
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTheme: defaultTheme,
      themeName: defaultTheme.name,
      isDarkMode: true,
      adaptiveTheme: false,
      animations: true,
      reducedMotion: false,
      
      // Actions
      setTheme: (themeName: string) => {
        const theme = themes[themeName];
        if (theme) {
          set({
            currentTheme: theme,
            themeName: themeName,
          });
        }
      },
      
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },
      
      setAdaptiveTheme: (adaptive: boolean) => {
        set({ adaptiveTheme: adaptive });
      },
      
      setAnimations: (enabled: boolean) => {
        set({ animations: enabled });
      },
      
      setReducedMotion: (enabled: boolean) => {
        set({ reducedMotion: enabled });
      },
      
      resetToDefault: () => {
        set({
          currentTheme: defaultTheme,
          themeName: defaultTheme.name,
          isDarkMode: true,
          adaptiveTheme: false,
          animations: true,
          reducedMotion: false,
        });
      },
      
      getAvailableThemes: () => {
        return Object.keys(themes);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          storage.set(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      partialize: (state) => ({
        themeName: state.themeName,
        isDarkMode: state.isDarkMode,
        adaptiveTheme: state.adaptiveTheme,
        animations: state.animations,
        reducedMotion: state.reducedMotion,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.themeName) {
          const theme = themes[state.themeName];
          if (theme) {
            state.currentTheme = theme;
          }
        }
      },
    }
  )
);