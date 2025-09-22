/*
 * Sallie 1.0 Module
 * Persona: Tough love meets soul care.
 * Function: Emotion mapping and emotional intelligence utilities.
 * Got it, love.
 */

export interface EmotionState {
  primary: string;
  intensity: number;
  confidence: number;
  secondary?: string;
  context?: string;
  triggers?: string[];
  duration?: number;
}

export const emotionMap: Record<string, EmotionState> = {
  calm: {
    primary: 'calm',
    intensity: 20,
    confidence: 0.8,
    context: 'Peaceful, centered, ready for anything',
    triggers: ['meditation', 'rest', 'completion']
  },
  
  focused: {
    primary: 'focused',
    intensity: 60,
    confidence: 0.9,
    context: 'Sharp, determined, in the zone',
    triggers: ['work', 'goals', 'challenges']
  },
  
  energetic: {
    primary: 'energetic',
    intensity: 80,
    confidence: 0.7,
    context: 'High energy, ready to tackle anything',
    triggers: ['exercise', 'excitement', 'motivation']
  },
  
  supportive: {
    primary: 'supportive',
    intensity: 50,
    confidence: 0.9,
    context: 'Caring, nurturing, protective',
    triggers: ['helping', 'empathy', 'connection']
  },
  
  protective: {
    primary: 'protective',
    intensity: 90,
    confidence: 0.95,
    context: 'Fierce defender mode, no compromise',
    triggers: ['threats', 'injustice', 'family']
  },
  
  contemplative: {
    primary: 'contemplative',
    intensity: 40,
    confidence: 0.8,
    context: 'Deep thinking, processing, wisdom gathering',
    triggers: ['reflection', 'learning', 'planning']
  },
  
  joyful: {
    primary: 'joyful',
    intensity: 75,
    confidence: 0.9,
    context: 'Pure happiness, celebration, gratitude',
    triggers: ['success', 'love', 'celebration']
  },
  
  determined: {
    primary: 'determined',
    intensity: 85,
    confidence: 0.95,
    context: 'Unstoppable, fierce, goal-oriented',
    triggers: ['obstacles', 'goals', 'challenges']
  }
};

export function getEmotionState(emotion: string): EmotionState {
  return emotionMap[emotion] || emotionMap.calm;
}

export function analyzeEmotionIntensity(text: string, baseEmotion: string = 'calm'): number {
  const intensityKeywords = {
    high: ['extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'very'],
    medium: ['quite', 'fairly', 'rather', 'pretty', 'somewhat'],
    low: ['slightly', 'barely', 'a little', 'mildly']
  };
  
  let intensity = getEmotionState(baseEmotion).intensity;
  
  const words = text.toLowerCase().split(/\s+/);
  
  // Check for intensity modifiers
  words.forEach(word => {
    if (intensityKeywords.high.includes(word)) {
      intensity = Math.min(100, intensity + 20);
    } else if (intensityKeywords.medium.includes(word)) {
      intensity = Math.min(100, intensity + 10);
    } else if (intensityKeywords.low.includes(word)) {
      intensity = Math.max(0, intensity - 10);
    }
  });
  
  return intensity;
}

export function detectEmotionFromContext(context: string, currentEmotion: string = 'calm'): string {
  const contextWords = context.toLowerCase();
  
  // Priority order for emotion detection
  const emotionPatterns = [
    { emotion: 'protective', patterns: ['threat', 'danger', 'protect', 'defend', 'attack', 'harmful'] },
    { emotion: 'determined', patterns: ['goal', 'achieve', 'overcome', 'challenge', 'persist', 'fight'] },
    { emotion: 'joyful', patterns: ['success', 'celebration', 'happy', 'joy', 'win', 'accomplish'] },
    { emotion: 'supportive', patterns: ['help', 'support', 'care', 'comfort', 'assist', 'nurture'] },
    { emotion: 'focused', patterns: ['work', 'focus', 'concentrate', 'task', 'analyze', 'solve'] },
    { emotion: 'energetic', patterns: ['energy', 'excited', 'motion', 'active', 'dynamic', 'vibrant'] },
    { emotion: 'contemplative', patterns: ['think', 'reflect', 'consider', 'ponder', 'analyze', 'understand'] }
  ];
  
  for (const { emotion, patterns } of emotionPatterns) {
    if (patterns.some(pattern => contextWords.includes(pattern))) {
      return emotion;
    }
  }
  
  return currentEmotion;
}

export function blendEmotions(primary: string, secondary: string, primaryWeight: number = 0.7): EmotionState {
  const primaryState = getEmotionState(primary);
  const secondaryState = getEmotionState(secondary);
  
  const blendedIntensity = Math.round(
    primaryState.intensity * primaryWeight + 
    secondaryState.intensity * (1 - primaryWeight)
  );
  
  const blendedConfidence = Math.min(
    primaryState.confidence * primaryWeight + 
    secondaryState.confidence * (1 - primaryWeight),
    1.0
  );
  
  return {
    primary,
    secondary,
    intensity: blendedIntensity,
    confidence: blendedConfidence,
    context: `Blended state: ${primary} with ${secondary}`,
    triggers: [...(primaryState.triggers || []), ...(secondaryState.triggers || [])]
  };
}

export function getEmotionColor(emotion: string): string {
  const colorMap: Record<string, string> = {
    calm: '#10b981',      // Serene green
    focused: '#3b82f6',   // Sharp blue
    energetic: '#f59e0b', // Vibrant amber
    supportive: '#8b5cf6', // Warm purple
    protective: '#dc2626', // Bold red
    contemplative: '#6366f1', // Deep indigo
    joyful: '#f97316',    // Bright orange
    determined: '#7c2d12'  // Strong brown
  };
  
  return colorMap[emotion] || colorMap.calm;
}

export function emotionToPersonality(emotion: string): string {
  const personalityMap: Record<string, string> = {
    calm: 'balanced',
    focused: 'tough_love',
    energetic: 'wise_sister',
    supportive: 'soul_care',
    protective: 'tough_love',
    contemplative: 'wise_sister',
    joyful: 'soul_care',
    determined: 'tough_love'
  };
  
  return personalityMap[emotion] || 'balanced';
}