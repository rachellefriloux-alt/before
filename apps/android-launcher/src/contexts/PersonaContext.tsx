/*
 * Sallie Sovereign - Persona Context
 * React context for managing personality and emotional state
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSallieSystem } from '../../../core/init';
import { PersonalityState, PersonalitySystem } from '../../../core/personality/PersonalitySystem';
import { EmotionalState, EmotionalEngine } from '../../../core/emotional/EmotionalEngine';

interface PersonaContextType {
  personalityState: PersonalityState | null;
  currentEmotion: string;
  emotionalState: EmotionalState | null;
  
  // Actions
  updatePersonality: (data: any) => Promise<void>;
  analyzeUserEmotion: (text: string) => EmotionalState;
  getResponseStyle: () => Record<string, any>;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

interface PersonaProviderProps {
  children: ReactNode;
}

export function PersonaProvider({ children }: PersonaProviderProps) {
  const [personalityState, setPersonalityState] = useState<PersonalityState | null>(null);
  const [emotionalState, setEmotionalState] = useState<EmotionalState | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('content');

  // System references
  const [personalitySystem, setPersonalitySystem] = useState<PersonalitySystem | null>(null);
  const [emotionalEngine, setEmotionalEngine] = useState<EmotionalEngine | null>(null);

  useEffect(() => {
    initializePersonaSystems();
  }, []);

  const initializePersonaSystems = async () => {
    try {
      const sallieSystem = getSallieSystem();
      
      const personality = sallieSystem.getPersonalitySystem();
      const emotional = sallieSystem.getEmotionalEngine();

      setPersonalitySystem(personality);
      setEmotionalEngine(emotional);

      // Get initial states
      setPersonalityState(personality.getPersonalityState());
      setEmotionalState(emotional.getCurrentState());
      setCurrentEmotion(emotional.getCurrentState().primary);

      // Listen for updates
      personality.on('personalityUpdated', (newState: PersonalityState) => {
        setPersonalityState(newState);
      });

      emotional.on('emotionChanged', (emotion: string) => {
        setCurrentEmotion(emotion);
      });

      emotional.on('emotionalStateUpdated', (newState: EmotionalState) => {
        setEmotionalState(newState);
      });

    } catch (error) {
      console.error('Failed to initialize persona systems:', error);
    }
  };

  const updatePersonality = async (interactionData: any): Promise<void> => {
    if (personalitySystem) {
      await personalitySystem.evolvePersonality(interactionData);
    }
  };

  const analyzeUserEmotion = (text: string): EmotionalState => {
    if (emotionalEngine) {
      return emotionalEngine.analyzeTextEmotion(text);
    }
    
    // Fallback basic emotion analysis
    return {
      primary: 'neutral',
      secondary: [],
      intensity: 0.5,
      valence: 0.0,
      arousal: 0.5,
      dominance: 0.5,
      timestamp: Date.now()
    };
  };

  const getResponseStyle = (): Record<string, any> => {
    if (personalitySystem) {
      return personalitySystem.getResponseStyle();
    }
    
    return {
      warmth: 0.8,
      creativity: 0.7,
      protectiveness: 0.8,
      playfulness: 0.6,
      wisdom: 0.7,
      energy: 0.8,
      mood: 'content'
    };
  };

  const contextValue: PersonaContextType = {
    personalityState,
    currentEmotion,
    emotionalState,
    updatePersonality,
    analyzeUserEmotion,
    getResponseStyle,
  };

  return (
    <PersonaContext.Provider value={contextValue}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}