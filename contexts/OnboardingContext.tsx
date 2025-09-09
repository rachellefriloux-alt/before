import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { useUserStore } from '@/app/store/user';

export interface QAAnswer {
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
}

interface OnboardingState {
  currentStage: number;
  answers: QAAnswer;
  isComplete: boolean;
}

type OnboardingAction =
  | { type: 'NEXT_STAGE' }
  | { type: 'SET_ANSWER'; key: keyof QAAnswer; value: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET' };

const initialState: OnboardingState = {
  currentStage: 0,
  answers: {},
  isComplete: false,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STAGE':
      return {
        ...state,
        currentStage: state.currentStage + 1,
      };
    case 'SET_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.key]: action.value,
        },
      };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isComplete: true,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const OnboardingContext = createContext<{
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
} | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const { profile, setOnboardingAnswer, completeOnboarding, updateOnboarding } = useUserStore();

  // Sync with user store on mount
  useEffect(() => {
    if (profile?.onboarding) {
      // Load existing onboarding data from user store
      Object.entries(profile.onboarding.answers || {}).forEach(([key, value]) => {
        if (value) {
          dispatch({
            type: 'SET_ANSWER',
            key: key as keyof QAAnswer,
            value,
          });
        }
      });

      if (profile.onboarding.completed) {
        dispatch({ type: 'COMPLETE_ONBOARDING' });
      }
    }
  }, [profile]);

  // Enhanced dispatch to sync with user store
  const enhancedDispatch = (action: OnboardingAction) => {
    dispatch(action);

    // Sync specific actions with user store
    if (action.type === 'SET_ANSWER') {
      setOnboardingAnswer(action.key, action.value);
    } else if (action.type === 'COMPLETE_ONBOARDING') {
      completeOnboarding();
    }
  };

  return (
    <OnboardingContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}