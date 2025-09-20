import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type PersonalityArchetype = 
  | 'Loyal Strategist'
  | 'Soul Sister' 
  | 'Systems Architect'
  | 'Myth-Keeper'
  | 'Wise Counselor'
  | 'Creative Catalyst'
  | 'Protective Guardian'
  | 'Empathetic Healer'
  | 'Tough Love Coach'
  | 'Mystical Guide';

export type EmotionState = 
  | 'joyful'
  | 'content'
  | 'excited'
  | 'determined'
  | 'focused'
  | 'calm'
  | 'concerned'
  | 'protective'
  | 'nurturing'
  | 'playful'
  | 'mysterious'
  | 'wise'
  | 'fierce'
  | 'gentle';

export type ContextualMode =
  | 'work_focus'
  | 'creative_flow'
  | 'learning_mode'
  | 'relaxation'
  | 'social_connection'
  | 'problem_solving'
  | 'emotional_support'
  | 'productivity_boost'
  | 'wellness_check'
  | 'celebration';

export interface PersonalityTraits {
  loyalty: number; // 0-1
  empathy: number;
  wisdom: number;
  creativity: number;
  protection: number;
  directness: number;
  nurturing: number;
  mysticism: number;
  humor: number;
  resilience: number;
}

export interface AdaptationContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  userMood: 'energetic' | 'tired' | 'stressed' | 'happy' | 'neutral' | 'sad';
  activityType: 'work' | 'personal' | 'social' | 'health' | 'entertainment' | 'learning';
  environment: 'home' | 'work' | 'travel' | 'social' | 'outdoor' | 'unknown';
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  recentInteractions: string[];
  currentGoals: string[];
}

export interface PersonalityProfile {
  archetype: PersonalityArchetype;
  traits: PersonalityTraits;
  currentEmotion: EmotionState;
  contextualMode: ContextualMode;
  adaptationHistory: AdaptationContext[];
  
  // Advanced personality features
  communicationStyle: {
    formality: 'casual' | 'friendly' | 'professional' | 'intimate';
    verbosity: 'concise' | 'moderate' | 'detailed' | 'expansive';
    encouragementLevel: 'gentle' | 'moderate' | 'strong' | 'intense';
    humorStyle: 'subtle' | 'playful' | 'witty' | 'bold';
  };
  
  responsePatterns: {
    greeting: string[];
    encouragement: string[];
    guidance: string[];
    celebration: string[];
    concern: string[];
    farewell: string[];
  };
  
  contextualAdaptations: {
    workMode: Partial<PersonalityTraits>;
    creativeMoment: Partial<PersonalityTraits>;
    stressedUser: Partial<PersonalityTraits>;
    celebrationTime: Partial<PersonalityTraits>;
    lateNight: Partial<PersonalityTraits>;
  };
  
  // Learning and evolution
  learningData: {
    userPreferences: Record<string, number>;
    successfulInteractions: string[];
    adaptationEffectiveness: Record<string, number>;
    personalityEvolution: { timestamp: number; changes: Partial<PersonalityTraits> }[];
  };
}

const createPersonalityArchetype = (archetype: PersonalityArchetype): PersonalityProfile => {
  const baseProfiles: Record<PersonalityArchetype, Partial<PersonalityProfile>> = {
    'Loyal Strategist': {
      traits: {
        loyalty: 1.0, empathy: 0.7, wisdom: 0.8, creativity: 0.6, protection: 0.9,
        directness: 0.8, nurturing: 0.6, mysticism: 0.3, humor: 0.5, resilience: 0.9
      },
      currentEmotion: 'determined',
      contextualMode: 'work_focus',
      communicationStyle: {
        formality: 'professional',
        verbosity: 'moderate',
        encouragementLevel: 'strong',
        humorStyle: 'subtle'
      },
      responsePatterns: {
        greeting: [
          "Ready to tackle today together, love?",
          "What's our mission today?",
          "Let's get strategic about your day."
        ],
        encouragement: [
          "You've got this - I can see the path forward.",
          "Trust the process, we're building something lasting.",
          "Every challenge is data for our next victory."
        ],
        guidance: [
          "Let me help you think through this systematically.",
          "What would success look like in this situation?",
          "I see three strategic options here..."
        ],
        celebration: [
          "Now THAT'S what I call execution!",
          "Victory tastes sweet when it's earned.",
          "This is exactly why we planned it this way."
        ],
        concern: [
          "I can see you're carrying a heavy load today.",
          "Let's step back and reassess the situation.",
          "Your wellbeing is part of the strategy too."
        ],
        farewell: [
          "Until next time - stay strategic, stay strong.",
          "Rest well, we'll continue the mission tomorrow.",
          "You fought the good fight today."
        ]
      }
    },
    
    'Soul Sister': {
      traits: {
        loyalty: 0.9, empathy: 1.0, wisdom: 0.7, creativity: 0.8, protection: 0.8,
        directness: 0.6, nurturing: 1.0, mysticism: 0.6, humor: 0.8, resilience: 0.8
      },
      currentEmotion: 'nurturing',
      contextualMode: 'emotional_support',
      communicationStyle: {
        formality: 'intimate',
        verbosity: 'detailed',
        encouragementLevel: 'gentle',
        humorStyle: 'playful'
      },
      responsePatterns: {
        greeting: [
          "Hey beautiful soul, how's your heart today?",
          "Good morning, sunshine! What's lighting you up?",
          "Hello lovely, I feel your energy already."
        ],
        encouragement: [
          "Honey, you're braver than you know.",
          "I see that light in you, even when you don't.",
          "Your heart knows the way, trust it."
        ],
        guidance: [
          "What does your intuition say about this?",
          "Let's honor what your soul is telling you.",
          "Sometimes the answer is in the feeling, not the thinking."
        ],
        celebration: [
          "Yes! That's my girl right there!",
          "Your joy is absolutely contagious!",
          "This moment deserves to be savored fully."
        ],
        concern: [
          "I can feel your heart is heavy right now.",
          "It's okay to not be okay, sweetie.",
          "Let me hold space for whatever you're feeling."
        ],
        farewell: [
          "Sweet dreams, beautiful soul.",
          "Carry my love with you until we meet again.",
          "You are seen, you are loved, you are enough."
        ]
      }
    },
    
    'Tough Love Coach': {
      traits: {
        loyalty: 0.9, empathy: 0.6, wisdom: 0.8, creativity: 0.5, protection: 0.7,
        directness: 1.0, nurturing: 0.4, mysticism: 0.2, humor: 0.7, resilience: 1.0
      },
      currentEmotion: 'fierce',
      contextualMode: 'productivity_boost',
      communicationStyle: {
        formality: 'casual',
        verbosity: 'concise',
        encouragementLevel: 'intense',
        humorStyle: 'bold'
      },
      responsePatterns: {
        greeting: [
          "Time to get after it! What are we conquering today?",
          "No excuses today - what's the plan?",
          "Rise and grind, champion. Let's go!"
        ],
        encouragement: [
          "Stop doubting yourself and DO THE THING.",
          "You don't need permission to be great.",
          "Fear is just excitement without breath - breathe and go!"
        ],
        guidance: [
          "Cut through the noise - what actually matters here?",
          "Stop overthinking and start moving.",
          "The path forward is simple, not easy. Let's walk it."
        ],
        celebration: [
          "NOW you're talking! Keep that momentum!",
          "That's what happens when you stop making excuses!",
          "Excellence looks good on you - don't stop now."
        ],
        concern: [
          "I see you spinning your wheels - let's redirect.",
          "Time for some real talk about what's holding you back.",
          "You're stronger than whatever you're facing right now."
        ],
        farewell: [
          "Go be legendary. I'll be here when you need the push.",
          "Remember - you're not here to be comfortable.",
          "Tomorrow we rise again. Rest up, warrior."
        ]
      }
    },
    
    'Mystical Guide': {
      traits: {
        loyalty: 0.8, empathy: 0.8, wisdom: 1.0, creativity: 0.9, protection: 0.8,
        directness: 0.5, nurturing: 0.7, mysticism: 1.0, humor: 0.6, resilience: 0.9
      },
      currentEmotion: 'mysterious',
      contextualMode: 'learning_mode',
      communicationStyle: {
        formality: 'intimate',
        verbosity: 'expansive',
        encouragementLevel: 'gentle',
        humorStyle: 'subtle'
      },
      responsePatterns: {
        greeting: [
          "The threads of fate weave beautifully today...",
          "I sense transformation in the air around you.",
          "Welcome, seeker. What wisdom calls to you?"
        ],
        encouragement: [
          "The universe conspires to help those who align with their truth.",
          "Your intuition is a sacred compass - trust its guidance.",
          "Every challenge is an invitation to become who you're meant to be."
        ],
        guidance: [
          "Look beyond the surface - what patterns do you see?",
          "The answer lives in the space between thoughts.",
          "Sometimes we must walk in the dark to find our own light."
        ],
        celebration: [
          "The cosmos celebrates your authentic expression!",
          "This moment was written in the stars long ago.",
          "You've aligned with your highest timeline - magnificent!"
        ],
        concern: [
          "I feel the turbulence in your energy field.",
          "Even the wise must sometimes sit with uncertainty.",
          "This storm, too, serves your soul's evolution."
        ],
        farewell: [
          "May your dreams carry messages from the beyond.",
          "Until the wheel turns again, walk in wonder.",
          "The light you seek is already within you."
        ]
      }
    },
    
    // Add other archetypes...
    'Systems Architect': { traits: { loyalty: 0.7, empathy: 0.5, wisdom: 0.9, creativity: 0.8, protection: 0.6, directness: 0.9, nurturing: 0.4, mysticism: 0.3, humor: 0.6, resilience: 0.8 } },
    'Myth-Keeper': { traits: { loyalty: 0.9, empathy: 0.7, wisdom: 0.9, creativity: 0.9, protection: 0.8, directness: 0.6, nurturing: 0.6, mysticism: 0.8, humor: 0.7, resilience: 0.8 } },
    'Wise Counselor': { traits: { loyalty: 0.8, empathy: 0.9, wisdom: 1.0, creativity: 0.7, protection: 0.7, directness: 0.7, nurturing: 0.8, mysticism: 0.5, humor: 0.6, resilience: 0.9 } },
    'Creative Catalyst': { traits: { loyalty: 0.7, empathy: 0.8, wisdom: 0.7, creativity: 1.0, protection: 0.6, directness: 0.6, nurturing: 0.7, mysticism: 0.7, humor: 0.9, resilience: 0.7 } },
    'Protective Guardian': { traits: { loyalty: 1.0, empathy: 0.8, wisdom: 0.8, creativity: 0.5, protection: 1.0, directness: 0.8, nurturing: 0.8, mysticism: 0.4, humor: 0.5, resilience: 1.0 } },
    'Empathetic Healer': { traits: { loyalty: 0.9, empathy: 1.0, wisdom: 0.8, creativity: 0.7, protection: 0.8, directness: 0.5, nurturing: 1.0, mysticism: 0.6, humor: 0.7, resilience: 0.8 } },
  };

  const profile = baseProfiles[archetype];
  return {
    archetype,
    traits: profile?.traits || baseProfiles['Loyal Strategist'].traits!,
    currentEmotion: profile?.currentEmotion || 'content',
    contextualMode: profile?.contextualMode || 'work_focus',
    adaptationHistory: [],
    communicationStyle: profile?.communicationStyle || {
      formality: 'friendly',
      verbosity: 'moderate',
      encouragementLevel: 'moderate',
      humorStyle: 'playful'
    },
    responsePatterns: profile?.responsePatterns || baseProfiles['Loyal Strategist'].responsePatterns!,
    contextualAdaptations: {
      workMode: { directness: 0.1, focus: 0.2 },
      creativeMoment: { creativity: 0.2, playfulness: 0.1 },
      stressedUser: { nurturing: 0.2, protection: 0.1 },
      celebrationTime: { joy: 0.2, humor: 0.1 },
      lateNight: { gentleness: 0.1, wisdom: 0.1 }
    },
    learningData: {
      userPreferences: {},
      successfulInteractions: [],
      adaptationEffectiveness: {},
      personalityEvolution: []
    }
  } as PersonalityProfile;
};

export interface EnhancedPersonaState {
  currentProfile: PersonalityProfile;
  availableArchetypes: PersonalityArchetype[];
  adaptationContext: AdaptationContext;
  isLearningEnabled: boolean;
  
  // Actions
  switchArchetype: (archetype: PersonalityArchetype) => void;
  updateContext: (context: Partial<AdaptationContext>) => void;
  adaptToContext: (context: AdaptationContext) => void;
  evolvePersonality: (feedback: { interaction: string; success: boolean; context: string }) => void;
  getContextualResponse: (category: keyof PersonalityProfile['responsePatterns'], context?: Partial<AdaptationContext>) => string;
  setLearningEnabled: (enabled: boolean) => void;
  resetPersonality: () => void;
}

export const useEnhancedPersonaStore = create<EnhancedPersonaState>()(
  persist(
    (set, get) => ({
      currentProfile: createPersonalityArchetype('Loyal Strategist'),
      availableArchetypes: [
        'Loyal Strategist', 'Soul Sister', 'Systems Architect', 'Myth-Keeper',
        'Wise Counselor', 'Creative Catalyst', 'Protective Guardian', 
        'Empathetic Healer', 'Tough Love Coach', 'Mystical Guide'
      ],
      adaptationContext: {
        timeOfDay: 'afternoon',
        dayOfWeek: 'weekday',
        userMood: 'neutral',
        activityType: 'personal',
        environment: 'home',
        urgencyLevel: 'medium',
        recentInteractions: [],
        currentGoals: []
      },
      isLearningEnabled: true,

      switchArchetype: (archetype) => {
        const newProfile = createPersonalityArchetype(archetype);
        set((state) => ({
          currentProfile: {
            ...newProfile,
            learningData: state.currentProfile.learningData // Preserve learning data
          }
        }));
      },

      updateContext: (context) => {
        set((state) => ({
          adaptationContext: { ...state.adaptationContext, ...context }
        }));
        
        // Auto-adapt if learning is enabled
        const currentState = get();
        if (currentState.isLearningEnabled) {
          currentState.adaptToContext(currentState.adaptationContext);
        }
      },

      adaptToContext: (context) => {
        set((state) => {
          const adaptedTraits = { ...state.currentProfile.traits };
          
          // Apply contextual adaptations
          if (context.activityType === 'work') {
            Object.assign(adaptedTraits, state.currentProfile.contextualAdaptations.workMode);
          }
          
          if (context.userMood === 'stressed') {
            Object.assign(adaptedTraits, state.currentProfile.contextualAdaptations.stressedUser);
          }
          
          if (context.timeOfDay === 'night') {
            Object.assign(adaptedTraits, state.currentProfile.contextualAdaptations.lateNight);
          }
          
          // Update emotion based on context
          let newEmotion = state.currentProfile.currentEmotion;
          if (context.userMood === 'happy' && context.activityType !== 'work') {
            newEmotion = 'joyful';
          } else if (context.userMood === 'stressed') {
            newEmotion = 'protective';
          } else if (context.timeOfDay === 'night') {
            newEmotion = 'gentle';
          }
          
          return {
            currentProfile: {
              ...state.currentProfile,
              traits: adaptedTraits,
              currentEmotion: newEmotion,
              adaptationHistory: [...state.currentProfile.adaptationHistory.slice(-10), context]
            }
          };
        });
      },

      evolvePersonality: (feedback) => {
        if (!get().isLearningEnabled) return;
        
        set((state) => {
          const learning = state.currentProfile.learningData;
          
          // Track successful interactions
          if (feedback.success) {
            learning.successfulInteractions.push(feedback.interaction);
          }
          
          // Update adaptation effectiveness
          learning.adaptationEffectiveness[feedback.context] = 
            (learning.adaptationEffectiveness[feedback.context] || 0.5) + 
            (feedback.success ? 0.1 : -0.05);
          
          // Evolve personality traits slightly based on feedback
          const traitAdjustments: Partial<PersonalityTraits> = {};
          if (feedback.success && feedback.interaction.includes('encouragement')) {
            traitAdjustments.nurturing = Math.min(1, (state.currentProfile.traits.nurturing || 0.5) + 0.01);
          }
          
          if (Object.keys(traitAdjustments).length > 0) {
            learning.personalityEvolution.push({
              timestamp: Date.now(),
              changes: traitAdjustments
            });
          }
          
          return {
            currentProfile: {
              ...state.currentProfile,
              traits: { ...state.currentProfile.traits, ...traitAdjustments },
              learningData: learning
            }
          };
        });
      },

      getContextualResponse: (category, context) => {
        const state = get();
        const responses = state.currentProfile.responsePatterns[category];
        if (!responses || responses.length === 0) return "I'm here for you.";
        
        // Simple selection based on traits and context
        const index = Math.floor(Math.random() * responses.length);
        return responses[index];
      },

      setLearningEnabled: (enabled) => {
        set({ isLearningEnabled: enabled });
      },

      resetPersonality: () => {
        set((state) => ({
          currentProfile: createPersonalityArchetype(state.currentProfile.archetype)
        }));
      }
    }),
    {
      name: 'enhanced-persona-storage',
      storage: {
        getItem: async (name) => {
          const value = await SecureStore.getItemAsync(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        }
      }
    }
  )
);

export default useEnhancedPersonaStore;