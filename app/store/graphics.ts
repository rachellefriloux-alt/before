import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface GraphicsSettings {
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'default' | 'high_contrast' | 'color_blind';
  fontSize: 'small' | 'medium' | 'large' | 'extra_large';
  animations: boolean;
  reducedMotion: boolean;
  highQualityGraphics: boolean;
  particleEffects: boolean;
  backgroundEffects: boolean;
}

interface GraphicsState {
  settings: GraphicsSettings;
  performanceMode: boolean;
  batterySaver: boolean;

  // Actions
  updateSettings: (settings: Partial<GraphicsSettings>) => void;
  setTheme: (theme: GraphicsSettings['theme']) => void;
  setColorScheme: (colorScheme: GraphicsSettings['colorScheme']) => void;
  setFontSize: (fontSize: GraphicsSettings['fontSize']) => void;
  toggleAnimations: () => void;
  toggleReducedMotion: () => void;
  toggleHighQualityGraphics: () => void;
  toggleParticleEffects: () => void;
  toggleBackgroundEffects: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  setBatterySaver: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings: GraphicsSettings = {
  theme: 'auto',
  colorScheme: 'default',
  fontSize: 'medium',
  animations: true,
  reducedMotion: false,
  highQualityGraphics: true,
  particleEffects: true,
  backgroundEffects: true,
};

export const useGraphicsStore = create<GraphicsState>()(
  persist(
    (set, get) => ({
      settings: { ...defaultSettings },
      performanceMode: false,
      batterySaver: false,

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setTheme: (theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      setColorScheme: (colorScheme) => {
        set((state) => ({
          settings: { ...state.settings, colorScheme },
        }));
      },

      setFontSize: (fontSize) => {
        set((state) => ({
          settings: { ...state.settings, fontSize },
        }));
      },

      toggleAnimations: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            animations: !state.settings.animations,
          },
        }));
      },

      toggleReducedMotion: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            reducedMotion: !state.settings.reducedMotion,
          },
        }));
      },

      toggleHighQualityGraphics: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            highQualityGraphics: !state.settings.highQualityGraphics,
          },
        }));
      },

      toggleParticleEffects: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            particleEffects: !state.settings.particleEffects,
          },
        }));
      },

      toggleBackgroundEffects: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            backgroundEffects: !state.settings.backgroundEffects,
          },
        }));
      },

      setPerformanceMode: (enabled) => {
        set({ performanceMode: enabled });
        if (enabled) {
          // Automatically adjust settings for performance
          set((state) => ({
            settings: {
              ...state.settings,
              animations: false,
              particleEffects: false,
              backgroundEffects: false,
              highQualityGraphics: false,
            },
          }));
        }
      },

      setBatterySaver: (enabled) => {
        set({ batterySaver: enabled });
        if (enabled) {
          // Automatically adjust settings for battery saving
          set((state) => ({
            settings: {
              ...state.settings,
              animations: false,
              particleEffects: false,
              backgroundEffects: false,
            },
          }));
        }
      },

      resetToDefaults: () => {
        set({
          settings: { ...defaultSettings },
          performanceMode: false,
          batterySaver: false,
        });
      },
    }),
    {
      name: 'graphics-storage',
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
    }
  )
);
