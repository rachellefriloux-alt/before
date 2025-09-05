import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export interface PersonaState {
  // Emotional state
  emotion: string;
  intensity: number;
  valence: number; // positive/negative scale
  arousal: number; // energy level
  
  // Personality traits
  tone: string;
  mood: string;
  personality: string;
  
  // Emotional history
  emotionHistory: Array<{
    timestamp: number;
    emotion: string;
    intensity: number;
    trigger: string;
  }>;
  
  // Actions
  setEmotion: (emotion: string, intensity?: number, trigger?: string) => void;
  setTone: (tone: string) => void;
  setMood: (mood: string) => void;
  setPersonality: (personality: string) => void;
  updateEmotionalState: (updates: Partial<PersonaState>) => void;
  getEmotionalContext: () => string;
  clearEmotionHistory: () => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      // Initial state
      emotion: 'calm',
      intensity: 0.5,
      valence: 0.5,
      arousal: 0.5,
      tone: 'neutral',
      mood: 'content',
      personality: 'tough_love_soul_care',
      emotionHistory: [],
      
      // Actions
      setEmotion: (emotion: string, intensity: number = 0.5, trigger: string = '') => {
        const timestamp = Date.now();
        set((state) => ({
          emotion,
          intensity,
          emotionHistory: [
            ...state.emotionHistory.slice(-99), // Keep last 100 entries
            { timestamp, emotion, intensity, trigger }
          ]
        }));
      },
      
      setTone: (tone: string) => set({ tone }),
      setMood: (mood: string) => set({ mood }),
      setPersonality: (personality: string) => set({ personality }),
      
      updateEmotionalState: (updates: Partial<PersonaState>) => set(updates),
      
      getEmotionalContext: () => {
        const state = get();
        return `Emotion: ${state.emotion} (${state.intensity}), Tone: ${state.tone}, Mood: ${state.mood}`;
      },
      
      clearEmotionHistory: () => set({ emotionHistory: [] })
    }),
    {
      name: 'persona-storage',
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
