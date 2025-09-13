import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

interface OnboardingAnswers {
  name?: string;
  mission?: string;
  dare?: string;
  season?: string;
  decisionStyle?: string;
  [key: string]: any;
}

interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  createdAt: Date;
  onboarding?: {
    completed: boolean;
    currentStep: number;
    answers: OnboardingAnswers;
  };
  preferences?: Record<string, any>;
}

interface UserState {
  profile: UserProfile | null;
  isOnboardingComplete: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setOnboardingStep: (step: number) => void;
  setOnboardingAnswers: (answers: OnboardingAnswers) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isOnboardingComplete: false,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      })),

      completeOnboarding: () => set((state) => ({
        isOnboardingComplete: true,
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            ...state.profile.onboarding,
            completed: true,
          },
        } : null,
      })),

      resetOnboarding: () => set((state) => ({
        isOnboardingComplete: false,
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            completed: false,
            currentStep: 0,
            answers: {},
          },
        } : null,
      })),

      setOnboardingStep: (step) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            ...state.profile.onboarding,
            currentStep: step,
          },
        } : null,
      })),

      setOnboardingAnswers: (answers) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            ...state.profile.onboarding,
            answers: { ...state.profile.onboarding?.answers, ...answers },
          },
        } : null,
      })),

      clearProfile: () => set({
        profile: null,
        isOnboardingComplete: false,
      }),
    }),
    {
      name: 'user-store',
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