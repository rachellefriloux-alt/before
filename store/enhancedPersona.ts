/**
 * ╭──────────────────────────────────────────────────────────────────────────────╮
 * │                                                                              │
 * │   Enhanced Persona Store with PersonaEngine Integration                      │
 * │                                                                              │
 * │   Advanced persona management with Sallie-isms, emotional adaptation,        │
 * │   and conversation flow management while maintaining MMKV persistence        │
 * │                                                                              │
 * ╰──────────────────────────────────────────────────────────────────────────────╯
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

import { PersonaEngine, defaultPersonaConfig, createPersonaEngine } from '../src/core/PersonaEngine';
import { MemoryStoreAdapter } from '../src/core/MemoryStoreAdapter';
import {
  PersonalityTraits,
  PersonaResponse,
  ContextAwareness,
  PersonaMetrics,
  SallieIsms,
  EmotionalAdaptation,
  MoodProfile,
} from '../src/core/PersonaEngine.types';

const storage = new MMKV();

// Backward compatibility interfaces
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

// Enhanced state interface
interface EnhancedPersonaState {
  // Core PersonaEngine
  personaEngine: PersonaEngine | null;
  initialized: boolean;
  
  // Backward compatibility fields
  emotion: string;
  intensity: number;
  valence: number;
  arousal: number;
  emotionHistory: EmotionRecord[];
  personality: PersonalityTrait[];
  currentMood: string;
  tone: string;
  mood: string;
  lastUpdated: number;

  // Enhanced PersonaEngine features
  personaMetrics: PersonaMetrics | null;
  sallieIsms: SallieIsms | null;
  conversationFlowId: string | null;
  adaptationHistory: EmotionalAdaptation[];
  moodProfile: MoodProfile | null;

  // Actions - Backward Compatibility
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

  // Enhanced PersonaEngine Actions
  initializePersonaEngine: () => Promise<void>;
  generatePersonaResponse: (input: string, context?: Partial<ContextAwareness>) => Promise<PersonaResponse>;
  adaptToContext: (context: ContextAwareness) => Promise<EmotionalAdaptation>;
  updatePersonaTraits: (traits: Partial<PersonalityTraits>) => Promise<void>;
  getPersonaMetrics: () => PersonaMetrics | null;
  getSallieIsm: (category?: keyof SallieIsms) => string;
  startConversationFlow: (context?: Partial<ContextAwareness>) => string;
  endConversationFlow: () => void;
  getMoodProfile: () => MoodProfile | null;
  resetPersonaEngine: () => Promise<void>;
}

// Default personality traits for backward compatibility
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

export const useEnhancedPersonaStore = create<EnhancedPersonaState>()(
  persist(
    (set, get) => ({
      // Core PersonaEngine
      personaEngine: null,
      initialized: false,

      // Backward compatibility defaults
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

      // Enhanced features
      personaMetrics: null,
      sallieIsms: null,
      conversationFlowId: null,
      adaptationHistory: [],
      moodProfile: null,

      // Initialize PersonaEngine
      initializePersonaEngine: async () => {
        try {
          if (get().personaEngine) {
            return; // Already initialized
          }

          const memoryAdapter = new MemoryStoreAdapter();
          const personaEngine = createPersonaEngine(defaultPersonaConfig, memoryAdapter);
          
          // Set up event listeners
          personaEngine.on('persona:adaptation:completed', (adaptation: EmotionalAdaptation) => {
            set((state) => ({
              adaptationHistory: [adaptation, ...state.adaptationHistory].slice(0, 10),
              emotion: adaptation.new_emotion,
              lastUpdated: Date.now(),
            }));
          });

          personaEngine.on('persona:mood:updated', ({ mood }: { mood: string }) => {
            set({
              currentMood: mood,
              mood: mood,
              lastUpdated: Date.now(),
            });
          });

          set({
            personaEngine,
            initialized: true,
            personaMetrics: personaEngine.getMetrics(),
            sallieIsms: personaEngine.getSallieIsms(),
            moodProfile: personaEngine.moodProfile,
            lastUpdated: Date.now(),
          });

          console.log('PersonaEngine initialized successfully');
        } catch (error) {
          console.error('Failed to initialize PersonaEngine:', error);
        }
      },

      // Generate response using PersonaEngine
      generatePersonaResponse: async (input: string, context?: Partial<ContextAwareness>) => {
        const state = get();
        if (!state.personaEngine) {
          await get().initializePersonaEngine();
        }

        const fullContext: ContextAwareness = {
          userEmotion: state.emotion,
          conversationTone: state.tone,
          relationshipStage: 'soul_sister',
          contextDepth: 0.8,
          sharedExperiences: ['conversation'],
          moodTrajectory: 'stable',
          energyLevel: 'medium',
          timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening',
          conversationPhase: 'deepening',
          userState: 'engaged',
          ...context,
        };

        try {
          const response = await state.personaEngine!.generateResponse(input, fullContext);
          
          // Update state based on response
          set({
            emotion: response.emotion,
            conversationFlowId: response.conversation_flow_id || state.conversationFlowId,
            personaMetrics: state.personaEngine!.getMetrics(),
            lastUpdated: Date.now(),
          });

          return response;
        } catch (error) {
          console.error('PersonaEngine response generation failed:', error);
          // Fallback response with Sallie-ism
          return {
            text: "I'm having a moment of technical difficulty, but I'm still here with you. Got it, love? 💕",
            emotion: 'concerned',
            confidence: 0.3,
            personality_traits_expressed: ['empathy', 'supportiveness'],
            sallie_ism_used: "Got it, love? 💕",
            next_conversation_suggestions: ['Try rephrasing your question', 'Let me know what you need help with'],
          };
        }
      },

      // Adapt to user context
      adaptToContext: async (context: ContextAwareness) => {
        const state = get();
        if (!state.personaEngine) {
          await get().initializePersonaEngine();
        }

        try {
          const adaptation = await state.personaEngine!.adaptToContext(context);
          
          // Update state
          set({
            emotion: adaptation.new_emotion,
            adaptationHistory: [adaptation, ...state.adaptationHistory].slice(0, 10),
            personaMetrics: state.personaEngine!.getMetrics(),
            lastUpdated: Date.now(),
          });

          return adaptation;
        } catch (error) {
          console.error('Context adaptation failed:', error);
          throw error;
        }
      },

      // Update persona traits
      updatePersonaTraits: async (traits: Partial<PersonalityTraits>) => {
        const state = get();
        if (!state.personaEngine) {
          await get().initializePersonaEngine();
        }

        try {
          await state.personaEngine!.updateTraits(traits);
          set({
            personaMetrics: state.personaEngine!.getMetrics(),
            lastUpdated: Date.now(),
          });
        } catch (error) {
          console.error('Trait update failed:', error);
          throw error;
        }
      },

      // Get current metrics
      getPersonaMetrics: () => {
        const state = get();
        return state.personaEngine?.getMetrics() || null;
      },

      // Get a Sallie-ism
      getSallieIsm: (category?: keyof SallieIsms) => {
        const state = get();
        const sallieIsms = state.sallieIsms;
        
        if (!sallieIsms) {
          return "Got it, love 💕"; // Default fallback
        }

        const selectedCategory = category || 'signatureCloses';
        const phrases = sallieIsms[selectedCategory] || sallieIsms.signatureCloses;
        return phrases[Math.floor(Math.random() * phrases.length)];
      },

      // Start conversation flow
      startConversationFlow: (context?: Partial<ContextAwareness>) => {
        const flowId = `flow_${Date.now()}`;
        set({
          conversationFlowId: flowId,
          lastUpdated: Date.now(),
        });
        return flowId;
      },

      // End conversation flow
      endConversationFlow: () => {
        set({
          conversationFlowId: null,
          lastUpdated: Date.now(),
        });
      },

      // Get mood profile
      getMoodProfile: () => {
        const state = get();
        return state.personaEngine?.moodProfile || null;
      },

      // Reset PersonaEngine
      resetPersonaEngine: async () => {
        const state = get();
        if (state.personaEngine) {
          state.personaEngine.dispose();
        }
        set({
          personaEngine: null,
          initialized: false,
          personaMetrics: null,
          sallieIsms: null,
          conversationFlowId: null,
          adaptationHistory: [],
          moodProfile: null,
          lastUpdated: Date.now(),
        });
        await get().initializePersonaEngine();
      },

      // ========================================================================
      // BACKWARD COMPATIBILITY METHODS
      // ========================================================================

      setEmotion: (emotion, intensity = 0.5, context = '') => {
        const timestamp = Date.now();
        set((state) => ({
          emotion,
          intensity,
          lastUpdated: timestamp,
          emotionHistory: [
            { emotion, intensity, timestamp, context },
            ...state.emotionHistory.slice(0, 99),
          ],
        }));

        // Also update PersonaEngine if available
        const state = get();
        if (state.personaEngine) {
          const contextAwareness: ContextAwareness = {
            userEmotion: emotion,
            conversationTone: state.tone,
            relationshipStage: 'soul_sister',
            contextDepth: intensity,
            sharedExperiences: [context].filter(Boolean),
            moodTrajectory: 'changing',
            energyLevel: intensity > 0.7 ? 'high' : intensity > 0.4 ? 'medium' : 'low',
            timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
            conversationPhase: 'building',
            userState: 'expressive',
          };
          
          get().adaptToContext(contextAwareness).catch(console.error);
        }
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

      updatePersonalityTrait: (trait, value) => {
        set((state) => ({
          personality: state.personality.map(p => 
            p.name === trait ? { ...p, value: Math.max(-1, Math.min(1, value)) } : p
          ),
        }));

        // Also update PersonaEngine traits if available
        const state = get();
        if (state.personaEngine && trait in state.personaEngine.getTraits()) {
          const traitUpdate = { [trait]: value } as Partial<PersonalityTraits>;
          get().updatePersonaTraits(traitUpdate).catch(console.error);
        }
      },

      setMood: (mood) => set({
        currentMood: mood,
        mood: mood,
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
      name: 'enhanced-persona-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = storage.getString(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          // Don't persist the PersonaEngine instance itself
          const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
          const { personaEngine, ...persistedState } = parsedValue;
          storage.set(name, JSON.stringify(persistedState));
        },
        removeItem: (name) => {
          storage.delete(name);
        },
      })),
      // Only persist certain fields, not the PersonaEngine instance
      partialize: (state) => ({
        emotion: state.emotion,
        intensity: state.intensity,
        valence: state.valence,
        arousal: state.arousal,
        emotionHistory: state.emotionHistory,
        personality: state.personality,
        currentMood: state.currentMood,
        tone: state.tone,
        mood: state.mood,
        lastUpdated: state.lastUpdated,
        adaptationHistory: state.adaptationHistory,
        conversationFlowId: state.conversationFlowId,
      }),
      // Reinitialize PersonaEngine on hydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize PersonaEngine after store is hydrated
          setTimeout(() => {
            state.initializePersonaEngine().catch(console.error);
          }, 100);
        }
      },
    }
  )
);

// Auto-initialize PersonaEngine when store is created
setTimeout(() => {
  useEnhancedPersonaStore.getState().initializePersonaEngine().catch(console.error);
}, 100);