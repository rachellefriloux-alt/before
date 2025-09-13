import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EmotionRecord {
  emotion: string;
  intensity: number;
  timestamp: number;
  context?: string;
}

interface PersonalityTrait {
  name: string;
  value: number; // -1 to 1 scale
  description?: string;
}

interface PersonaState {
  emotion: string;
  intensity: number; // 0-1 scale
  valence: number; // -1 to 1 scale (negative to positive)
  arousal: number; // 0-1 scale (calm to excited)
  emotionHistory: EmotionRecord[];
  personality: PersonalityTrait[];
  currentMood: string;
  tone: string;
  mood: string;
  lastUpdated: number;

  // Actions
  setEmotion: (emotion: string, intensity?: number, context?: string) => void;
  setValence: (valence: number) => void;
  setArousal: (arousal: number) => void;
  updateEmotionalState: (emotion: string, intensity: number, valence: number, arousal: number) => void;
  addEmotionRecord: (emotion: string, intensity: number, context?: string) => void;
  updatePersonalityTrait: (trait: string, value: number) => void;
  setMood: (mood: string) => void;
  getEmotionalState: () => { emotion: string; intensity: number; valence: number; arousal: number };
  getRecentEmotions: (timeframe: number) => EmotionRecord[];
  clearEmotionHistory: () => void;
  getEmotionalContext: () => {
    emotion: string;
    mood: string;
    tone: string;
    intensity: number;
    valence: number;
    arousal: number;
  };
}

const defaultPersonality: PersonalityTrait[] = [
  { name: 'openness', value: 0.7, description: 'Openness to experience' },
  { name: 'conscientiousness', value: 0.8, description: 'Conscientiousness and organization' },
  { name: 'extraversion', value: 0.6, description: 'Extraversion and social energy' },
  { name: 'agreeableness', value: 0.7, description: 'Agreeableness and cooperation' },
  { name: 'neuroticism', value: 0.3, description: 'Emotional stability (low neuroticism)' },
  { name: 'tough_love', value: 0.8, description: 'Tendency to provide tough love guidance' },
  { name: 'empathy', value: 0.9, description: 'Empathetic understanding' },
  { name: 'directness', value: 0.7, description: 'Direct communication style' },
];

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set, get) => ({
      emotion: 'calm',
      intensity: 0.5,
      valence: 0.1,
      arousal: 0.3,
      emotionHistory: [],
      personality: defaultPersonality,
      currentMood: 'supportive',
      tone: 'warm',
      mood: 'supportive',
      lastUpdated: Date.now(),

      setEmotion: (emotion, intensity = 0.5, context = '') => {
        const timestamp = Date.now();
        set((state) => ({
          emotion,
          intensity,
          lastUpdated: timestamp,
          emotionHistory: [
            { emotion, intensity, timestamp, context },
            ...state.emotionHistory.slice(0, 99), // Keep last 100 records
          ],
        }));
      },

      setValence: (valence) => set({
        valence: Math.max(-1, Math.min(1, valence)),
        lastUpdated: Date.now(),
      }),

      setArousal: (arousal) => set({
        arousal: Math.max(0, Math.min(1, arousal)),
        lastUpdated: Date.now(),
      }),

      updateEmotionalState: (emotion, intensity, valence, arousal) => {
        const timestamp = Date.now();
        set((state) => ({
          emotion,
          intensity: Math.max(0, Math.min(1, intensity)),
          valence: Math.max(-1, Math.min(1, valence)),
          arousal: Math.max(0, Math.min(1, arousal)),
          lastUpdated: timestamp,
          emotionHistory: [
            { emotion, intensity, timestamp },
            ...state.emotionHistory.slice(0, 99),
          ],
        }));
      },

      addEmotionRecord: (emotion, intensity, context) => {
        const timestamp = Date.now();
        set((state) => ({
          emotionHistory: [
            { emotion, intensity, timestamp, context },
            ...state.emotionHistory.slice(0, 99),
          ],
        }));
      },

      updatePersonalityTrait: (trait, value) => set((state) => ({
        personality: state.personality.map(p => 
          p.name === trait ? { ...p, value: Math.max(-1, Math.min(1, value)) } : p
        ),
      })),

      setMood: (mood) => set({
        currentMood: mood,
        lastUpdated: Date.now(),
      }),

      getEmotionalState: () => {
        const state = get();
        return {
          emotion: state.emotion,
          intensity: state.intensity,
          valence: state.valence,
          arousal: state.arousal,
        };
      },

      getRecentEmotions: (timeframe) => {
        const state = get();
        const cutoff = Date.now() - timeframe;
        return state.emotionHistory.filter(record => record.timestamp > cutoff);
      },

      clearEmotionHistory: () => set({
        emotionHistory: [],
        lastUpdated: Date.now(),
      }),

      getEmotionalContext: () => {
        const state = get();
        return {
          emotion: state.emotion,
          mood: state.mood,
          tone: state.tone,
          intensity: state.intensity,
          valence: state.valence,
          arousal: state.arousal,
        };
      },
    }),
    {
      name: 'persona-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);