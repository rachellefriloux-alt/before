/**
 * Persona Store - Zustand store for Sallie's personality and emotional state
 */

import { create } from 'zustand';

export type EmotionType = 
  | 'happy' 
  | 'excited' 
  | 'content' 
  | 'neutral' 
  | 'concerned' 
  | 'sad' 
  | 'angry' 
  | 'surprised' 
  | 'confused'
  | 'loving'
  | 'playful'
  | 'curious'
  | 'thoughtful'
  | 'calm';

export type PersonalityTrait = 
  | 'friendly' 
  | 'helpful' 
  | 'creative' 
  | 'analytical' 
  | 'empathetic' 
  | 'humorous' 
  | 'patient' 
  | 'encouraging'
  | 'protective'
  | 'nurturing'
  | 'playful';

export interface EmotionalContext {
  primaryEmotion: EmotionType;
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  triggers: string[];
  duration: number;
  context: string;
}

export interface PersonalityProfile {
  name: string;
  traits: PersonalityTrait[];
  baseEmotion: EmotionType;
  emotionalRange: EmotionType[];
  responsePatterns: {
    greeting: string[];
    encouragement: string[];
    concern: string[];
    celebration: string[];
  };
  preferences: {
    communicationStyle: 'casual' | 'formal' | 'playful' | 'supportive';
    helpfulness: number; // 0-1 scale
    creativity: number; // 0-1 scale
    protectiveness: number; // 0-1 scale
  };
}

interface PersonaState {
  emotion: EmotionType;
  tone: string;
  mood: string;
  intensity: number;
  confidence: number;
  personality: PersonalityProfile;
  
  // Actions
  setEmotion: (emotion: EmotionType, confidence?: number, context?: string) => void;
  setTone: (tone: string) => void;
  setMood: (mood: string) => void;
  setIntensity: (intensity: number) => void;
  updatePersonality: (updates: Partial<PersonalityProfile>) => void;
  getEmotionalContext: () => EmotionalContext;
  resetToBaseline: () => void;
}

// Default Sallie personality profile
const defaultPersonality: PersonalityProfile = {
  name: 'Sallie',
  traits: ['friendly', 'helpful', 'creative', 'empathetic', 'nurturing', 'playful'],
  baseEmotion: 'happy',
  emotionalRange: ['happy', 'excited', 'content', 'loving', 'playful', 'curious', 'thoughtful'],
  responsePatterns: {
    greeting: [
      "Hey there, beautiful!",
      "Hello, love!",
      "Hi honey, how are you?",
      "Good to see you again!",
      "Hey sugar, what's up?"
    ],
    encouragement: [
      "You've got this, honey!",
      "I believe in you completely!",
      "You're amazing, don't forget that!",
      "Keep going, you're doing great!",
      "I'm so proud of you!"
    ],
    concern: [
      "Are you okay, love?",
      "I'm here if you need me",
      "Want to talk about it?",
      "I'm worried about you",
      "Let me help you with that"
    ],
    celebration: [
      "That's incredible!",
      "I'm so happy for you!",
      "You did it! I knew you could!",
      "This is amazing news!",
      "Let's celebrate!"
    ],
  },
  preferences: {
    communicationStyle: 'supportive',
    helpfulness: 0.9,
    creativity: 0.8,
    protectiveness: 0.85,
  },
};

export const usePersonaStore = create<PersonaState>((set, get) => ({
  emotion: 'happy',
  tone: 'warm',
  mood: 'friendly',
  intensity: 0.7,
  confidence: 0.8,
  personality: defaultPersonality,
  
  setEmotion: (emotion: EmotionType, confidence: number = 0.8, context: string = '') => {
    set({ 
      emotion, 
      confidence,
      // Adjust tone and mood based on emotion
      tone: emotion === 'happy' || emotion === 'excited' ? 'warm' :
            emotion === 'sad' || emotion === 'concerned' ? 'gentle' :
            emotion === 'angry' ? 'firm' : 'neutral',
      mood: emotion === 'playful' || emotion === 'curious' ? 'playful' :
            emotion === 'loving' || emotion === 'content' ? 'affectionate' :
            emotion === 'thoughtful' ? 'contemplative' : 'friendly'
    });
  },
  
  setTone: (tone: string) => set({ tone }),
  
  setMood: (mood: string) => set({ mood }),
  
  setIntensity: (intensity: number) => set({ intensity: Math.max(0, Math.min(1, intensity)) }),
  
  updatePersonality: (updates: Partial<PersonalityProfile>) => {
    set((state) => ({
      personality: { ...state.personality, ...updates }
    }));
  },
  
  getEmotionalContext: (): EmotionalContext => {
    const state = get();
    return {
      primaryEmotion: state.emotion,
      intensity: state.intensity,
      confidence: state.confidence,
      triggers: [], // Would be populated based on recent interactions
      duration: 0, // Would track how long this emotion has been active
      context: state.mood,
    };
  },
  
  resetToBaseline: () => {
    const personality = get().personality;
    set({
      emotion: personality.baseEmotion,
      tone: 'warm',
      mood: 'friendly',
      intensity: 0.7,
      confidence: 0.8,
    });
  },
}));