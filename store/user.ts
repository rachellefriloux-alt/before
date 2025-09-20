import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  setOnboardingAnswer: (key: keyof OnboardingAnswers, value: string) => void;
  updateOnboarding: (updates: Partial<{ completed: boolean; currentStep: number; answers: OnboardingAnswers }>) => void;
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
            completed: true,
            currentStep: state.profile.onboarding?.currentStep || 0,
            answers: state.profile.onboarding?.answers || {},
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
            completed: state.profile.onboarding?.completed || false,
            currentStep: step,
            answers: state.profile.onboarding?.answers || {},
          },
        } : null,
      })),

      setOnboardingAnswers: (answers) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            completed: state.profile.onboarding?.completed || false,
            currentStep: state.profile.onboarding?.currentStep || 0,
            answers: { ...state.profile.onboarding?.answers, ...answers },
          },
        } : null,
      })),

      setOnboardingAnswer: (key, value) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            completed: state.profile.onboarding?.completed || false,
            currentStep: state.profile.onboarding?.currentStep || 0,
            answers: { ...state.profile.onboarding?.answers, [key]: value },
          },
        } : null,
      })),

      updateOnboarding: (updates) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          onboarding: {
            completed: updates.completed ?? (state.profile.onboarding?.completed || false),
            currentStep: updates.currentStep ?? (state.profile.onboarding?.currentStep || 0),
            answers: { ...(state.profile.onboarding?.answers || {}), ...(updates.answers || {}) },
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
