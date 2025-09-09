import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    language: string;
  };
  stats: {
    totalInteractions: number;
    favoritePersona: string;
    lastActive: Date;
    streakDays: number;
  };
  onboarding: {
    completed: boolean;
    currentStep: number;
    skippedSteps: number[];
    answers: {
      name?: string;
      title?: string;
      location?: string;
      season?: string;
      mission?: string;
      decisionStyle?: string;
      dare?: string;
      aesthetics?: string;
      rhythm?: string;
      nonnegotiable?: string;
    };
    completedAt?: Date;
  };
}

interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  updateStats: (stats: Partial<UserProfile['stats']>) => void;
  updateOnboarding: (onboarding: Partial<UserProfile['onboarding']>) => void;
  setOnboardingAnswer: (key: keyof UserProfile['onboarding']['answers'], value: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setAuthenticated: (authenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultProfile: UserProfile = {
  id: '',
  name: '',
  preferences: {
    theme: 'auto',
    notifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    language: 'en',
  },
  stats: {
    totalInteractions: 0,
    favoritePersona: '',
    lastActive: new Date(),
    streakDays: 0,
  },
  onboarding: {
    completed: false,
    currentStep: 0,
    skippedSteps: [],
    answers: {},
  },
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile, isAuthenticated: true }),

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, ...updates },
          });
        }
      },

      updatePreferences: (preferences) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              preferences: { ...currentProfile.preferences, ...preferences },
            },
          });
        }
      },

      updateStats: (stats) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              stats: { ...currentProfile.stats, ...stats },
            },
          });
        }
      },

      updateOnboarding: (onboarding) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              onboarding: { ...currentProfile.onboarding, ...onboarding },
            },
          });
        }
      },

      setOnboardingAnswer: (key, value) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              onboarding: {
                ...currentProfile.onboarding,
                answers: {
                  ...currentProfile.onboarding.answers,
                  [key]: value,
                },
              },
            },
          });
        }
      },

      completeOnboarding: () => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              onboarding: {
                ...currentProfile.onboarding,
                completed: true,
                completedAt: new Date(),
              },
            },
          });
        }
      },

      resetOnboarding: () => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              onboarding: {
                completed: false,
                currentStep: 0,
                skippedSteps: [],
                answers: {},
              },
            },
          });
        }
      },

      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      reset: () => set({
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'user-storage',
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
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
